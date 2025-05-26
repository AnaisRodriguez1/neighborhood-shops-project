import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { Shop, ShopSchema } from './entities/shop.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if GetUser decorator is used

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]),
    AuthModule, // Needed for @Auth() decorator and @GetUser()
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService, MongooseModule], // Export MongooseModule if other modules need ShopModel
})
export class ShopsModule {}
