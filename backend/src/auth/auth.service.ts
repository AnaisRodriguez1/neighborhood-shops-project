import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto,LoginUserDto } from './dto';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService:JwtService,
  
  ){}  async create(createUserDto: CreateUserDto) {
    try {

      const {password, rol, ...userData} = createUserDto;

      const user = await this.userModel.create({
        ...userData,
        password: bcrypt.hashSync(password,10),
        role: rol || 'comprador'
      });

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
  }  async login(loginUserDto: LoginUserDto) {
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
        .select('name email deliveryInfo')
        .exec();

      return deliveryPersons;
    } catch (error) {
      handleExceptions(error, 'los repartidores', 'obtener');
    }
  }

  async getAllDeliveryPersons() {
    try {
      const deliveryPersons = await this.userModel
        .find({
          role: 'repartidor',
          isActive: true
        })
        .select('name email deliveryInfo isActive')
        .exec();

      return deliveryPersons;
    } catch (error) {
      handleExceptions(error, 'los repartidores', 'obtener');
    }
  }
}
