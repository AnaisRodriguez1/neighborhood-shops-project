import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './entities/product.entity';
import { Shop, ShopSchema } from '../shops/entities/shop.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[
    ConfigModule,    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Shop.name,
        schema: ShopSchema,
      }
    ]),
    AuthModule,
  ],
  exports:[
    MongooseModule,
    ProductsService
  ]
})
export class ProductsModule {}