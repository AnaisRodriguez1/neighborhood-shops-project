import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Shop } from './entities/shop.entity';
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
  roles: string[];
}

@Injectable()
@Auth()
export class ShopsService {
  constructor(
    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>,
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
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      return await this.shopModel
        .find({ isActive: true })
        .limit(limit)
        .skip(offset)
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

  async update(id: string, updateShopDto: UpdateShopDto, user: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`'${id}' no es un ObjectId válido.`);
    }

    const shop = await this.findOne(id);

    if (shop.ownerId.toString() !== user._id.toString()) {
      throw new BadRequestException(
        'No tienes permisos para modificar esta tienda.',
      );
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
      handleExceptions(error, 'la tienda', 'actualizar');
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
}
