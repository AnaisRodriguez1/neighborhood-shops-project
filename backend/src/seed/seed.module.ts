import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Product, ProductSchema } from 'src/products/entities/product.entity';
import { Shop, ShopSchema } from 'src/shops/entities/shop.entity';
import { User, UserSchema } from 'src/auth/entities/user.entity';
import { Order, OrderSchema } from 'src/orders/entities/order.entity';
import { Supplier, SupplierSchema } from 'src/suppliers/entities/supplier.entity';
import { AuthModule } from '../auth/auth.module';

@Module({  imports: [
    AuthModule,    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Supplier.name, schema: SupplierSchema }
    ])
  ],

  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}