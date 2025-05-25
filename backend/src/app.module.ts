import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; 
import { ProductsModule } from './products/products.module';
import { Connection } from 'mongoose';
import { ShopsModule } from './shops/shops.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRoot(mongoUri, {
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
