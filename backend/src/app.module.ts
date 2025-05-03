import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; 
import { ProductsModule } from './products/products.module';
import { Connection } from 'mongoose';
import { ShopsModule } from './shops/shops.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRoot('mongodb://UserATMDB:MySecretPassWordProyectoATM@localhost:27017/ATMBD?authSource=admin', {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log('connected'));
        connection.on('open', () => console.log('open'));
        connection.on('disconnected', () => console.log('disconnected'));
        connection.on('reconnected', () => console.log('reconnected'));
        connection.on('disconnecting', () => console.log('disconnecting'));
    
        return connection;
      },
    }),

    ProductsModule,

    ShopsModule,

    CommonModule,

    AuthModule,

    SeedModule,
  ],
})
export class AppModule {}
