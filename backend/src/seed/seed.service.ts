import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { Product } from 'src/products/entities/product.entity';
import { products } from './data/products.seed';
import { Shop } from 'src/shops/entities/shop.entity';
import { shops } from './data/shop.seed';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {

  private readonly axios : AxiosInstance = axios;
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}


  async executeSeed() {
    try {
      const productResult = await this.productModel.deleteMany({});
      const shopResult = await this.shopModel.deleteMany({});

      const insertedProducts = await this.productModel.insertMany(products, { ordered: false });
      const insertedShops = await this.shopModel.insertMany(shops, { ordered: false });

      console.log('Productos insertados:', insertedProducts.length);
      console.log('Tiendas insertadas:', insertedShops.length);

      return {
        deletedProducts: productResult.deletedCount,
        insertedProducts: insertedProducts.length,
        deletedShops: shopResult.deletedCount,
        insertedShops: insertedShops.length,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async clearUsers() {
    try {
      const result = await this.userModel.deleteMany({});
      return {
        message: 'Usuarios eliminados exitosamente',
        deletedCount: result.deletedCount
      };
    } catch (error) {
      handleExceptions(error);
    }
  }
}