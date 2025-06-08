import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto,LoginUserDto } from './dto';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class AuthService {  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    private readonly jwtService:JwtService,
  
  ){}async create(createUserDto: CreateUserDto & { deliveryInfo?: any; shopData?: any }) {
    try {

      const {password, rol, deliveryInfo, shopData, ...userData} = createUserDto;

      // Create user with delivery info if provided
      const userPayload: any = {
        ...userData,
        password: bcrypt.hashSync(password,10),
        role: rol || 'comprador'
      };

      // Add delivery info for repartidores
      if (rol === 'repartidor' && deliveryInfo) {
        userPayload.deliveryInfo = {
          vehicle: deliveryInfo.vehicle || 'bicicleta',
          isAvailable: deliveryInfo.isAvailable || false,
          currentLocation: deliveryInfo.lat && deliveryInfo.lng 
            ? { lat: deliveryInfo.lat, lng: deliveryInfo.lng }
            : undefined
        };
      }

      const user = await this.userModel.create(userPayload);      // Create shop for locatarios
      if (rol === 'locatario' && shopData) {
        const shop = new this.shopModel({
          ...shopData,
          ownerId: user._id,
        });
        await shop.save();
      }

      //Va a regresar un JWT de la información del usuario 
      // (en este caso correo) sin el password
      return {
        email: user.email,
        id:user.id,
        name: user.name,
        role: user.role,
        token: this.getJwtToken({ id: user.id }),
      };


    } catch (error) {
      handleExceptions(error, 'el usuario', 'identificar');
    }
  }async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    // En Mongoose, el filtro va directo y select es un método encadenado
    const user = await this.userModel.findOne({ email })
    //Solicitud de datos a la base de datos
      .select({ email: 1, password: 1, name: 1, role: 1, id: 1}); 
    
    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)')
    }
    if(!bcrypt.compareSync(password,user.password)){
      throw new UnauthorizedException('Credentials are not valid (password)')
    }

    //retorna el jwt token
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      token: this.getJwtToken({id: user.id})
    };
  }  checkAuthStatus(user: User) {
    const userObj = user.toJSON();
    return{
      ...userObj,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken( payload: JwtPayload ){
    //Generar el token por servicio creado por mí
    const token = this.jwtService.sign( payload );
    return token;

  }

  async updateDeliveryInfo(userId: string, updateDeliveryInfoDto: any) {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (user.role !== 'repartidor') {
        throw new UnauthorizedException('Solo los repartidores pueden actualizar información de entrega');
      }

      const { vehicle, isAvailable, lat, lng } = updateDeliveryInfoDto;

      if (!user.deliveryInfo) {
        user.deliveryInfo = {
          vehicle: vehicle || 'bicicleta',
          isAvailable: isAvailable || false,
          currentLocation: lat && lng ? { lat, lng } : undefined
        };
      } else {
        if (vehicle !== undefined) user.deliveryInfo.vehicle = vehicle;
        if (isAvailable !== undefined) user.deliveryInfo.isAvailable = isAvailable;
        if (lat !== undefined && lng !== undefined) {
          user.deliveryInfo.currentLocation = { lat, lng };
        }
      }

      await user.save();

      return {
        message: 'Información de entrega actualizada exitosamente',
        deliveryInfo: user.deliveryInfo
      };

    } catch (error) {
      handleExceptions(error, 'la información de entrega', 'actualizar');
    }
  }
  async getAvailableDeliveryPersons() {
    try {
      const deliveryPersons = await this.userModel
        .find({
          role: 'repartidor',
          isActive: true,
          'deliveryInfo.isAvailable': true
        })
        .select('_id name email deliveryInfo')
        .exec();

      return deliveryPersons;
    } catch (error) {
      handleExceptions(error, 'los repartidores', 'obtener');
    }
  }  async getAllDeliveryPersons() {
    try {
      const deliveryPersons = await this.userModel
        .find({
          role: 'repartidor',
          isActive: true
        })
        .select('_id name email deliveryInfo isActive')
        .exec();

      return deliveryPersons;
    } catch (error) {
      handleExceptions(error, 'los repartidores', 'obtener');
    }
  }

  async getAllUsers(paginationDto: PaginationDto) {
    const { limit = 10, offset, page } = paginationDto;
    const calculatedOffset = offset !== undefined ? offset : (page ? (page - 1) * limit : 0);

    try {
      const users = await this.userModel
        .find({ isActive: true })
        .select('-password') // No incluir contraseñas
        .limit(limit)
        .skip(calculatedOffset)
        .sort({ createdAt: -1 });

      const total = await this.userModel.countDocuments({ isActive: true });

      return {
        users,
        total,
        page: page || 1,
        limit,
        hasMore: (calculatedOffset + limit) < total
      };
    } catch (error) {
      handleExceptions(error, 'los usuarios', 'obtener');
    }
  }

  async adminRemoveUser(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`'${id}' no es un ObjectId válido.`);
    }

    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
      }

      // No permitir que el admin se elimine a sí mismo
      if (user.role === 'presidente') {
        throw new BadRequestException('No se puede eliminar un usuario administrador.');
      }

      let deletedShopsCount = 0;
      let deletedProductsCount = 0;

      // Si es locatario, eliminar también sus tiendas y productos
      if (user.role === 'locatario') {
        // Buscar tiendas del usuario
        const shops = await this.shopModel.find({ ownerId: id });
        
        for (const shop of shops) {
          // Contar y eliminar productos de cada tienda
          const productsCount = await this.productModel.countDocuments({ shopId: shop._id });
          deletedProductsCount += productsCount;
          await this.productModel.deleteMany({ shopId: shop._id });
        }
        
        // Contar y eliminar tiendas del usuario
        deletedShopsCount = await this.shopModel.countDocuments({ ownerId: id });
        await this.shopModel.deleteMany({ ownerId: id });
      }

      // Eliminar el usuario
      await this.userModel.findByIdAndDelete(id);

      return { 
        message: `Usuario '${user.name}' (${user.role}) eliminado permanentemente por administrador.`,
        deletedShops: deletedShopsCount,
        deletedProducts: deletedProductsCount
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      handleExceptions(error, 'el usuario', 'eliminar');
    }
  }
}
