import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Shop } from './entities/shop.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { handleExceptions } from '../common/helpers/exception-handler.helper';
import { Auth } from 'src/auth/decorators';

// Interface para tipar correctamente al usuario autenticado
export interface AuthUser {
  _id: string | Types.ObjectId;
  email: string;
  name: string;
  role: string;
}

@Injectable()
@Auth()
export class ShopsService {  constructor(
    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async create(createShopDto: CreateShopDto, user: AuthUser) {
    try {
      const shop = new this.shopModel({
        ...createShopDto,
        ownerId: user._id,
      });
      return await shop.save(); // Slug se genera automáticamente por el pre-save hook
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Ya existe una tienda con ese nombre o slug.`,
        );
      }
      handleExceptions(error, 'la tienda', 'crear');
    }
  }
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset, page } = paginationDto;

    // Calculate offset: use provided offset or calculate from page
    const calculatedOffset = offset !== undefined ? offset : (page ? (page - 1) * limit : 0);

    try {
      return await this.shopModel
        .find({ isActive: true })
        .limit(limit)
        .skip(calculatedOffset)
        .sort({ name: 1 })
        .populate('ownerId', 'name email')
        .exec();
    } catch (error) {
      handleExceptions(error, 'las tiendas', 'listar');
    }
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`'${id}' no es un ObjectId válido.`);
    }

    const shop = await this.shopModel
      .findById(id)
      .populate('ownerId', 'name email')
      .exec();

    if (!shop) {
      throw new NotFoundException(`No se encontró una tienda con ID '${id}'.`);
    }

    return shop;
  }

  async findOneBySlug(slug: string) {
    const shop = await this.shopModel
      .findOne({ slug })
      .populate('ownerId', 'name email')
      .exec();

    if (!shop) {
      throw new NotFoundException(
        `No se encontró una tienda con el slug '${slug}'.`,
      );
    }

    return shop;
  }

  async update(id: string, updateShopDto: UpdateShopDto, user: AuthUser): Promise<Shop> {
    const shop = await this.shopModel.findById(id);
    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Verificar si el usuario es el propietario de la tienda o es presidente
    if (shop.ownerId.toString() !== user._id.toString() && user.role !== 'presidente') {
      throw new BadRequestException('No tienes permisos para modificar esta tienda.');
    }

    try {
      Object.assign(shop, updateShopDto);
      return await shop.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Ya existe otra tienda con ese nombre o slug.`,
        );
      }
      throw handleExceptions(error, 'la tienda', 'actualizar');
    }
  }

  async remove(id: string, user: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`'${id}' no es un ObjectId válido.`);
    }

    const shop = await this.findOne(id);

    if (shop.ownerId.toString() !== user._id.toString()) {
      throw new BadRequestException(
        'No tienes permisos para eliminar esta tienda.',
      );
    }

    try {
      const result = await this.shopModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException(`Tienda con ID '${id}' no encontrada.`);
      }
    } catch (error) {
      handleExceptions(error, 'la tienda', 'eliminar');
    }

    return { message: `Tienda con ID '${id}' eliminada correctamente.` };
  }

  async adminRemove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`'${id}' no es un ObjectId válido.`);
    }

    try {
      const shop = await this.shopModel.findById(id);
      if (!shop) {
        throw new NotFoundException(`Tienda con ID '${id}' no encontrada.`);
      }

      // Hard delete para administrador - elimina la tienda y todos sus productos
      await this.shopModel.findByIdAndDelete(id);
      
      // También eliminar todos los productos de esta tienda
      await this.productModel.deleteMany({ shopId: id });

      return { 
        message: `Tienda '${shop.name}' y todos sus productos eliminados permanentemente por administrador.` 
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleExceptions(error, 'la tienda', 'eliminar');
    }
  }
  async deleteAllShops(): Promise<{ message: string; deletedCount: number }> {
    try {
      const result = await this.shopModel.deleteMany({});
      return {
        message: 'Todas las tiendas han sido eliminadas.',
        deletedCount: result.deletedCount ?? 0,
      };
    } catch (error) {
      handleExceptions(error, 'las tiendas', 'eliminar');
      return {
        message: 'Error al eliminar tiendas.',
        deletedCount: 0,
      };
    }
  }

  async getAdminMetrics() {
    try {      // Get all shops with their metrics
      const shops = await this.shopModel
        .find({})
        .populate('ownerId', 'name email')
        .sort({ score: -1 })
        .exec();

      // Get total counts
      const totalShops = await this.shopModel.countDocuments({ isActive: true });
      const totalOrders = await this.orderModel.countDocuments({});
      const totalUsers = await this.userModel.countDocuments({ isActive: true });

      // Get orders by status
      const ordersByStatus = await this.orderModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get users by role
      const usersByRole = await this.userModel.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);      // Calculate average shop score and product rating
      const averageShopScore = shops.length > 0 
        ? shops.reduce((sum, shop) => sum + (shop.score || 0), 0) / shops.length
        : 0;

      // Get average product rating across all products
      const allProducts = await this.productModel.find({ rating: { $exists: true, $ne: null } }).select('rating');
      const averageProductRating = allProducts.length > 0
        ? allProducts.reduce((sum, product) => sum + (product.rating || 0), 0) / allProducts.length
        : 0;

      // Get recent orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = await this.orderModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });      // Top performing shops by score and activity
      const topShops = shops
        .filter(shop => shop.isActive)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5)
        .map(shop => ({
          id: shop._id,
          name: shop.name,
          score: shop.score || 0,
          categories: shop.categories,
          owner: shop.ownerId ? {
            name: (shop.ownerId as any).name,
            email: (shop.ownerId as any).email
          } : null
        }));return {
        overview: {
          totalShops,
          totalOrders,
          totalUsers,
          averageShopScore: Math.round(averageShopScore * 100) / 100,
          averageProductRating: Math.round(averageProductRating * 100) / 100,
          recentOrders
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topShops,        allShops: shops.map(shop => ({
          id: shop._id,
          name: shop.name,
          score: shop.score || 0,
          categories: shop.categories,
          isActive: shop.isActive,
          deliveryAvailable: shop.deliveryAvailable,
          pickupAvailable: shop.pickupAvailable,
          address: shop.address,
          owner: shop.ownerId ? {
            name: (shop.ownerId as any).name,
            email: (shop.ownerId as any).email
          } : null,
          createdAt: (shop as any).createdAt,
          updatedAt: (shop as any).updatedAt
        }))
      };
    } catch (error) {
      handleExceptions(error, 'las métricas del administrador', 'obtener');
    }
  }  async findByOwner(ownerId: string) {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new BadRequestException(`'${ownerId}' no es un ObjectId válido.`);
    }

    try {
      // Convert string to ObjectId for proper MongoDB query
      const ownerObjectId = new Types.ObjectId(ownerId);
      const query = { ownerId: ownerObjectId, isActive: true };

      const shops = await this.shopModel
        .find(query)        .sort({ name: 1 })
        .populate('ownerId', 'name email')
        .exec();
        
      return shops;
    } catch (error) {
      console.error('❌ Error in findByOwner:', error);
      handleExceptions(error, 'las tiendas del propietario', 'listar');
    }
  }

  async rateShop(shopId: string, ratingData: { rating: number; ratingChange: number; userId: string }, user: AuthUser) {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException(`'${shopId}' no es un ObjectId válido.`);
    }

    try {
      // Buscar la tienda
      const shop = await this.shopModel.findById(shopId);
      if (!shop) {
        throw new NotFoundException(`Tienda con id '${shopId}' no encontrada`);
      }

      // Verificar que el usuario no sea el propietario de la tienda
      if (shop.ownerId.toString() === user._id.toString()) {
        throw new BadRequestException('No puedes calificar tu propia tienda');
      }

      // Aplicar el cambio de rating
      const currentRating = shop.rating || 0;
      const newRating = Math.max(0, currentRating + ratingData.ratingChange);

      // Actualizar el rating de la tienda
      const updatedShop = await this.shopModel.findByIdAndUpdate(
        shopId,
        { rating: newRating },
        { new: true }
      ).populate('ownerId', 'name email');

      console.log(`🌟 Shop ${shop.name} rated ${ratingData.rating} stars by user ${user.name}. Rating changed from ${currentRating} to ${newRating}`);

      return {
        message: 'Calificación enviada exitosamente',
        shop: updatedShop,
        ratingChange: ratingData.ratingChange,
        newRating: newRating
      };
    } catch (error) {
      console.error('❌ Error rating shop:', error);
      handleExceptions(error, 'la tienda', 'calificar');
    }
  }
}
