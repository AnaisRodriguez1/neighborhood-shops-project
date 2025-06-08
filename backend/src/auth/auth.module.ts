import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { Shop, ShopSchema } from '../shops/entities/shop.entity';
import {PassportModule} from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports:[

    ConfigModule,    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Shop.name,
        schema: ShopSchema
      }
    ]),

    PassportModule.register({ defaultStrategy: 'jwt' }),    JwtModule.registerAsync({
      imports: [ ConfigModule],
      inject: [ConfigService],
      useFactory: ( configService : ConfigService ) => {
        const jwtSecret = configService.get('JWT_SECRET') || configService.get('jwtSecret') || 'fallback-development-secret';
        
        if (!jwtSecret || jwtSecret === 'fallback-development-secret') {
          console.warn('⚠️  Warning: Using fallback JWT secret. Set JWT_SECRET environment variable for production!');
        }
        
        return{
          secret: jwtSecret,
          signOptions:{
            expiresIn:'10h'
          }
        }
      }
    })

  ],
  exports:[JwtStrategy, MongooseModule, PassportModule, JwtModule]
})
export class AuthModule {}
