import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { Shop, ShopSchema } from './entities/shop.entity';
import { Order, OrderSchema } from '../orders/entities/order.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { Product, ProductSchema } from '../products/entities/product.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if GetUser decorator is used

@Module({  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthModule, // Needed for @Auth() decorator and @GetUser()
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService, MongooseModule], // Export MongooseModule if other modules need ShopModel
})
export class ShopsModule {}
