import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';

import { Product } from 'src/products/entities/product.entity';
import { products } from './data/products.seed';
import { processedSupplierProducts } from './data/products-suppliers.seed';

import { Shop } from 'src/shops/entities/shop.entity';
import { shops } from './data/shop.seed';

import { Order } from 'src/orders/entities/order.entity';
import { orders } from './data/orders.seed';

import { Supplier } from 'src/suppliers/entities/supplier.entity';
import { suppliers } from './data/suppliers.seed';

@Injectable()
export class SeedService {
  private readonly axios : AxiosInstance = axios;
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<Supplier>,
  ) {}
  async executeSeed() {
    try {
      // Limpiar datos existentes
      const productResult = await this.productModel.deleteMany({});
      const shopResult = await this.shopModel.deleteMany({});
      const orderResult = await this.orderModel.deleteMany({});
      const supplierResult = await this.supplierModel.deleteMany({});

      // Insertar nuevos datos
      const insertedShopProducts = await this.productModel.insertMany(products);
      const insertedSupplierProducts = await this.productModel.insertMany(processedSupplierProducts);
      const insertedShops = await this.shopModel.insertMany(shops);
      const insertedOrders = await this.orderModel.insertMany(orders);
      const insertedSuppliers = await this.supplierModel.insertMany(suppliers);

      console.log('Productos de tiendas insertados:', insertedShopProducts.length);
      console.log('Productos de proveedores insertados:', insertedSupplierProducts.length);
      console.log('Tiendas insertadas:', insertedShops.length);
      console.log('Pedidos insertados:', insertedOrders.length);
      console.log('Proveedores insertados:', insertedSuppliers.length);

      return {
        deletedProducts: productResult.deletedCount,
        insertedShopProducts: insertedShopProducts.length,
        insertedSupplierProducts: insertedSupplierProducts.length,
        deletedShops: shopResult.deletedCount,
        insertedShops: insertedShops.length,
        deletedOrders: orderResult.deletedCount,
        insertedOrders: insertedOrders.length,
        deletedSuppliers: supplierResult.deletedCount,
        insertedSuppliers: insertedSuppliers.length,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }
}