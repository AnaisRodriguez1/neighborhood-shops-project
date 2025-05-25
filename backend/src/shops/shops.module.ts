import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './entities/shop.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ShopsController],
  providers: [ShopsService],
  imports:[
        MongooseModule.forFeature([
          {
            name: Shop.name,
            schema: ShopSchema
          }
        ]),
        AuthModule
  ]
})
export class ShopsModule {}
