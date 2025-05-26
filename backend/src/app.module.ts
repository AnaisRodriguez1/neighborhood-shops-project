import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; 
import { Connection } from 'mongoose';
import 'dotenv/config';

import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { ShopsModule } from './shops/shops.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { EnvConfiguration } from './common/config/env.config';


const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}
console.log('Mongo URI:', mongoUri);

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ EnvConfiguration ],
  }),

    MongooseModule.forRoot(mongoUri, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log('connected'));
        connection.on('open', () => console.log('open'));
        connection.on('disconnected', () => console.log('disconnected'));
        connection.on('reconnected', () => console.log('reconnected'));
        connection.on('disconnecting', () => console.log('disconnecting'));
    
        return connection;
      },
      dbName: 'neighborhood-shops-project',
    }),

    ProductsModule,

    ShopsModule,

    CommonModule,

    AuthModule,

    SeedModule,
  ],
})
export class AppModule {}
