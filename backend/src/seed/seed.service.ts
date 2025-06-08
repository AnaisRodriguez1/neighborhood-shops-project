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
import { Order } from 'src/orders/entities/order.entity';
import { deliveryPersons } from './data/delivery-persons.seed';
import { orders } from './data/orders.seed';
import { users } from './data/users.seed';

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

    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  async executeSeed() {
    try {
      // Limpiar datos existentes
      const productResult = await this.productModel.deleteMany({});
      const shopResult = await this.shopModel.deleteMany({});
      const userResult = await this.userModel.deleteMany({});
      const orderResult = await this.orderModel.deleteMany({});

      // Insertar nuevos datos
      const insertedUsers = await this.userModel.insertMany(users, { ordered: false });
      const insertedProducts = await this.productModel.insertMany(products, { ordered: false });
      const insertedShops = await this.shopModel.insertMany(shops, { ordered: false });
      const insertedDeliveryPersons = await this.userModel.insertMany(deliveryPersons, { ordered: false });
      const insertedOrders = await this.orderModel.insertMany(orders, { ordered: false });

      console.log('Usuarios insertados:', insertedUsers.length);
      console.log('Productos insertados:', insertedProducts.length);
      console.log('Tiendas insertadas:', insertedShops.length);
      console.log('Repartidores insertados:', insertedDeliveryPersons.length);
      console.log('Pedidos insertados:', insertedOrders.length);

      return {
        deletedProducts: productResult.deletedCount,
        insertedProducts: insertedProducts.length,
        deletedShops: shopResult.deletedCount,
        insertedShops: insertedShops.length,
        deletedUsers: userResult.deletedCount,
        insertedUsers: insertedUsers.length,
        insertedDeliveryPersons: insertedDeliveryPersons.length,
        deletedOrders: orderResult.deletedCount,
        insertedOrders: insertedOrders.length,
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

  async seedDeliveryPersons() {
    try {
      const result = await this.userModel.deleteMany({ role: 'repartidor' });
      const insertedDeliveryPersons = await this.userModel.insertMany(deliveryPersons, { ordered: false });
      
      console.log('Repartidores insertados:', insertedDeliveryPersons.length);
      
      return {
        deletedDeliveryPersons: result.deletedCount,
        insertedDeliveryPersons: insertedDeliveryPersons.length,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }
  async seedOrders() {
    try {
      const result = await this.orderModel.deleteMany({});
      
      // Obtener productos y tiendas reales de la base de datos
      const products = await this.productModel.find({});
      const shops = await this.shopModel.find({});
      const users = await this.userModel.find({ role: { $ne: 'repartidor' } });
      const deliveryPersons = await this.userModel.find({ role: 'repartidor' });
      
      if (products.length === 0 || shops.length === 0 || users.length === 0) {
        console.log('No hay suficientes datos para crear órdenes. Asegúrate de que existan productos, tiendas y usuarios.');
        return {
          deletedOrders: result.deletedCount,
          insertedOrders: 0,
        };
      }

      // Crear órdenes con datos reales
      const ordersToInsert = [
        {
          client: users[0]._id,
          shop: shops[0]._id,
          items: [
            {
              product: products.find(p => p.name.includes('Lechuga'))?._id || products[0]._id,
              quantity: 2,
              price: 1390
            },
            {
              product: products.find(p => p.name.includes('Tomate'))?._id || products[1]._id,
              quantity: 1,
              price: 1990
            }
          ],
          deliveryAddress: {
            street: 'Av. Francisco de Aguirre 485',
            number: '485',
            district: 'Centro',
            city: 'La Serena',
            coordinates: {
              lat: -29.9027,
              lng: -71.2519
            },
            reference: 'Casa azul, tocar el portón principal'
          },
          totalAmount: 4770,
          deliveryFee: 0,
          notes: 'Tocar el portón principal, casa azul',
          paymentMethod: 'efectivo',
          status: 'pendiente'
        },
        {
          client: users[1] ? users[1]._id : users[0]._id,
          shop: shops[1] ? shops[1]._id : shops[0]._id,
          items: [
            {
              product: products.find(p => p.name.includes('Palta'))?._id || products[2]._id,
              quantity: 3,
              price: 890
            }
          ],
          deliveryAddress: {
            street: 'Av. Los Carrera 1456',
            number: '1456',
            district: 'Parte Alta',
            city: 'Coquimbo',
            coordinates: {
              lat: -29.9533,
              lng: -71.3436
            }
          },
          totalAmount: 2670,
          deliveryFee: 0,
          paymentMethod: 'tarjeta',
          status: 'confirmado'
        },
        {
          client: users[2] ? users[2]._id : users[0]._id,
          shop: shops[2] ? shops[2]._id : shops[0]._id,
          items: [
            {
              product: products.find(p => p.name.includes('Limón'))?._id || products[3]._id,
              quantity: 1,
              price: 1200
            },
            {
              product: products.find(p => p.name.includes('Cebolla'))?._id || products[4]._id,
              quantity: 2,
              price: 950
            }
          ],
          deliveryAddress: {
            street: 'Plaza de Armas 789',
            number: '789',
            district: 'Centro Histórico',
            city: 'Vicuña',
            coordinates: {
              lat: -30.0311,
              lng: -70.7081
            },
            reference: 'Casa con viñedos, valle de Elqui'
          },
          totalAmount: 3100,
          deliveryFee: 0,
          deliveryPerson: deliveryPersons[0]?._id,
          notes: 'Entregar en el valle de Elqui, casa con viñedos',
          paymentMethod: 'efectivo',
          status: 'preparando'
        }      ];
        console.log('Intentando insertar órdenes...');
      console.log('Número de órdenes a insertar:', ordersToInsert.length);
      
      // Test simple: crear una orden directamente sin insertMany
      console.log('Creando una orden simple para test...');
      const testOrder = new this.orderModel({
        client: users[0]._id,
        shop: shops[0]._id,
        items: [{
          product: products[0]._id,
          quantity: 1,
          price: 1000
        }],
        deliveryAddress: {
          street: 'Test Street',
          number: '123',
          district: 'Test',
          city: 'La Serena',
          coordinates: { lat: -29.9027, lng: -71.2519 }
        },
        totalAmount: 1000,
        paymentMethod: 'efectivo',
        status: 'pendiente'
      });
      
      try {
        console.log('Guardando orden test...');
        await testOrder.save();
        console.log('Orden test guardada exitosamente. OrderNumber:', testOrder.orderNumber);
        
        return {
          deletedOrders: result.deletedCount,
          insertedOrders: 1,
        };
      } catch (testError) {
        console.error('Error al guardar orden test:', testError);
        throw testError;
      }
    } catch (error) {
      console.error('Error en seedOrders:', error);
      handleExceptions(error);
    }
  }
}