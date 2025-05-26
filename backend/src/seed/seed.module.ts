import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Product, ProductSchema } from 'src/products/entities/product.entity';
import { Shop, ShopSchema } from 'src/shops/entities/shop.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Shop.name, schema: ShopSchema }  // 👈 ESTA ES LA CLAVE
    ])
  ],

  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
