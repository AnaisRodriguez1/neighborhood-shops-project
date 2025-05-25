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
  
  ){}

  async create(createUserDto: CreateUserDto) {
    try {

      const {password, ...userData} = createUserDto;

      const user = await this.userModel.create({
        ...userData,
        password: bcrypt.hashSync(password,10)
      });

      //Va a regresar un JWT de la información del usuario 
      // (en este caso correo) sin el password
      return {
        email: user.email,
        id:user.id,
        name: user.name,
        token: this.getJwtToken({ id: user.id }),
      };


    } catch (error) {
      handleExceptions(error, 'el usuario', 'identificar');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    // En Mongoose, el filtro va directo y select es un método encadenado
    const user = await this.userModel.findOne({ email })
    //Solicitud de datos a la base de datos
      .select({ email: 1, password: 1, id: 1}); // 0 = no mostrar, 1 = mostrar
    
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
      role: user.roles,
      token: this.getJwtToken({id: user.id})
    };
  }

  checkAuthStatus(user: User) {
    return{
      ...user.toJSON(),
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken( payload: JwtPayload ){
    //Generar el token por servicio creado por mí
    const token = this.jwtService.sign( payload );
    return token;

  }
}
