import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './entities/order.entity';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  AssignDeliveryPersonDto,
} from './dto';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { OrdersGateway } from './orders.gateway';

export interface AuthUser {
  _id: string | Types.ObjectId;
  email: string;
  name: string;
  role: string;
}

// Interface for populated order items
interface PopulatedOrderItem {
  product: {
    _id: Types.ObjectId;
    name: string;
    price: number;
    images?: string[];
    description?: string;
    stock?: number;
  } | null;
  quantity: number;
  price: number;
}

// Interface for populated orders
interface PopulatedOrder extends Omit<Order, 'items'> {
  items: PopulatedOrderItem[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: AuthUser) {
    try {
      const { shopId, items, deliveryAddress, notes, paymentMethod } =
        createOrderDto;
      const clientId = user._id;

      // Verificar que la tienda existe
      const shop = await this.shopModel.findById(shopId);
      if (!shop) {
        throw new NotFoundException('Tienda no encontrada');
      } // Calcular total y verificar productos
      let totalAmount = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Producto ${item.productId} no encontrado`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`,
          );
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        });

        // Actualizar stock
        product.stock -= item.quantity;
        await product.save();
      } // Crear pedido
      const order = new this.orderModel({
        client: clientId,
        shop: shopId,
        items: orderItems,
        deliveryAddress: {
          ...deliveryAddress,
          coordinates:
            deliveryAddress.lat && deliveryAddress.lng
              ? { lat: deliveryAddress.lat, lng: deliveryAddress.lng }
              : undefined,
        },
        totalAmount,
        notes,
        paymentMethod: paymentMethod || 'efectivo',
        status: 'pendiente',
      });

      await order.save();
      await order.populate(['client', 'shop', 'items.product']); // Notificar a la tienda vía WebSocket
      this.ordersGateway.emitToRoom(`shop-${shopId}`, 'new-order', {
        order,
        message: 'Nuevo pedido recibido',
      });

      // Notificar al cliente
      this.ordersGateway.emitToRoom(`client-${clientId}`, 'order-created', {
        order,
        message: 'Pedido creado exitosamente',
      });

      return {
        message: 'Pedido creado exitosamente',
        order,
      };
    } catch (error) {
      handleExceptions(error, 'el pedido', 'crear');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const orders = await this.orderModel
      .find()
      .populate('client', 'name email')
      .populate('shop', 'name address')
      .populate('deliveryPerson', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price images description stock',
        match: { _id: { $exists: true } },
      })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    // Filtrar items con productos null/undefined después del populate
    const cleanedOrders = orders.map((order) => {
      const validItems = order.items.filter(
        (item) => item.product && item.product !== null,
      );
      return {
        ...order.toObject(),
        items: validItems,
      };
    });

    return cleanedOrders;
  }
  async findByClient(clientId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException(`'${clientId}' no es un ObjectId válido.`);
    }

    // Fix any client fields that are stored as strings instead of ObjectId
    try {
      const clientObjectId = new Types.ObjectId(clientId);

      // First, fix any orders where client is stored as string
      const updateResult = await this.orderModel.updateMany(
        { client: clientId }, // Find orders where client is a string
        { $set: { client: clientObjectId } }, // Convert to ObjectId
      );      if (updateResult.modifiedCount > 0) {
        // Fixed some orders with string client field
      }

      // Use both string and ObjectId queries to ensure we find all orders
      const orders = await this.orderModel
        .find({
          $or: [
            { client: clientObjectId },
            { client: clientId }, // Also search for string version just in case
          ],
        })
        .populate('shop', 'name address')
        .populate('deliveryPerson', 'name email')
        .populate({
          path: 'items.product',
          select: 'name price images description stock',
          match: { _id: { $exists: true } },
        })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      // Filtrar items con productos null/undefined después del populate
      const cleanedOrders = orders.map((order) => {
        const validItems = order.items.filter(
          (item) => item.product && item.product !== null,
        );
        return {
          ...order.toObject(),
          items: validItems,        };
      });

      return cleanedOrders;
    } catch (error) {
      console.error('❌ Error finding client orders:', error);
      throw error;
    }
  }

  async findByShop(shopId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException(`'${shopId}' no es un ObjectId válido.`);
    }
    const orders = await this.orderModel
      .find({ shop: shopId })
      .populate('client', 'name email')
      .populate('deliveryPerson', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price images description stock',
        match: { _id: { $exists: true } },
      })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    // Filtrar items con productos null/undefined después del populate
    const cleanedOrders = orders.map((order) => {
      const validItems = order.items.filter(
        (item) => item.product && item.product !== null,
      );
      return {
        ...order.toObject(),
        items: validItems,
      };
    });

    return cleanedOrders;
  }
  async findByDeliveryPerson(
    deliveryPersonId: string,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;

    if (!Types.ObjectId.isValid(deliveryPersonId)) {
      throw new BadRequestException(
        `'${deliveryPersonId}' no es un ObjectId válido.`,
      );
    }
    const orders = await this.orderModel
      .find({ deliveryPerson: deliveryPersonId })
      .populate('client', 'name email')
      .populate('shop', 'name address')
      .populate({
        path: 'items.product',
        select: 'name price images description stock',
        match: { _id: { $exists: true } },
      })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    // Filtrar items con productos null/undefined después del populate
    const cleanedOrders = orders.map((order) => {
      const validItems = order.items.filter(
        (item) => item.product && item.product !== null,
      );
      return {
        ...order.toObject(),
        items: validItems,
      };
    });

    return cleanedOrders;
  }
  async findAllDeliveriesByDeliveryPerson(
    deliveryPersonId: string,
    paginationDto: PaginationDto,
  ) {
    try {
      const { limit = 50, offset, page } = paginationDto;
      const calculatedOffset =
        offset !== undefined ? offset : page ? (page - 1) * limit : 0;

      if (!Types.ObjectId.isValid(deliveryPersonId)) {
        throw new BadRequestException(
          `'${deliveryPersonId}' no es un ObjectId válido.`,
        );
      }

      // Buscar TODOS los pedidos asignados al repartidor (todos los status)
      const orders = await this.orderModel
        .find({ deliveryPerson: deliveryPersonId })
        .populate('client', 'name email')
        .populate('shop', 'name address')
        .populate({
          path: 'items.product',
          select: 'name price images description stock',
          match: { _id: { $exists: true } },
        })
        .populate('deliveryPerson', 'name email deliveryInfo')
        .skip(calculatedOffset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      // Filtrar items con productos null/undefined después del populate
      const cleanedOrders = orders.map((order) => {
        const validItems = order.items.filter(
          (item) => item.product && item.product !== null,
        );
        return {
          ...order.toObject(),
          items: validItems,
        };      });

      return cleanedOrders;
    } catch (error) {
      console.error('❌ Error finding delivery orders:', error);
      handleExceptions(error, 'los pedidos de entrega', 'obtener');
    }
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`'${id}' no es un ObjectId válido.`);
    }
    const order = await this.orderModel
      .findById(id)
      .populate('client', 'name email')
      .populate('shop', 'name address')
      .populate('deliveryPerson', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price images description stock',
        match: { _id: { $exists: true } },
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`No se encontró un pedido con ID '${id}'.`);
    }

    // Filtrar items con productos null/undefined después del populate
    const validItems = order.items.filter(
      (item) => item.product && item.product !== null,
    );
    const cleanedOrder = {
      ...order.toObject(),
      items: validItems,
    };

    return cleanedOrder;
  }
  async updateStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    user: AuthUser,
  ) {
    try {
      const { status, estimatedDeliveryTime } = updateOrderStatusDto;

      const order = await this.orderModel
        .findById(orderId)
        .populate(['client', 'shop', 'deliveryPerson']);
      if (!order) {
        throw new NotFoundException('Pedido no encontrado');
      } // Verificar permisos
      const userShop = await this.shopModel.findOne({ ownerId: user._id });
      // Debug logging
      console.log('=== DEBUG ORDER UPDATE AUTHORIZATION ===');
      console.log('User ID:', user._id);
      console.log('User role:', user.role);
      console.log(
        'User shop found:',
        userShop
          ? {
              id: userShop.id,
              _id: userShop._id,
              ownerId: userShop.ownerId,
            }
          : 'No shop found',
      );
      console.log(
        'Order shop:',
        order.shop
          ? {
              id: order.shop._id,
              _id: order.shop._id,
            }
          : 'No shop in order',
      );
      console.log('Order shop type:', typeof order.shop?._id);
      console.log('User shop type:', typeof userShop?._id);
      // Fix: Use _id consistently and convert both to string for comparison
      const isShopOwner =
        userShop &&
        order.shop._id.toString() === (userShop as any)._id.toString();
      console.log('Is shop owner check result:', isShopOwner);
      console.log('Shop ID comparison:', {
        orderShopId: order.shop?._id?.toString(),
        userShopId: (userShop as any)?._id?.toString(),
        equal:
          order.shop?._id?.toString() === (userShop as any)?._id?.toString(),
      });

      const isDeliveryPerson =
        user.role === 'repartidor' &&
        order.deliveryPerson?._id.toString() === user._id.toString();
      console.log('Is delivery person check result:', isDeliveryPerson);
      console.log('========================================');

      if (!isShopOwner && !isDeliveryPerson && user.role !== 'presidente') {
        throw new ForbiddenException(
          'No autorizado para actualizar este pedido',
        );
      }

      order.status = status;
      if (estimatedDeliveryTime) {
        order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
      }

      if (status === 'entregado') {
        order.actualDeliveryTime = new Date();
      }

      await order.save(); // Notificar cambios vía WebSocket
      this.ordersGateway.emitToRoom(
        `client-${order.client._id}`,
        'order-status-updated',
        {
          orderId: order._id,
          status,
          message: `Tu pedido está ${this.getStatusMessage(status)}`,
        },
      );

      if (order.deliveryPerson) {
        this.ordersGateway.emitToRoom(
          `delivery-${order.deliveryPerson._id}`,
          'order-status-updated',
          {
            orderId: order._id,
            status,
          },
        );
      }

      return {
        message: 'Estado actualizado exitosamente',
        order,
      };
    } catch (error) {
      handleExceptions(error, 'el pedido', 'actualizar');
    }
  }
  async assignDeliveryPerson(
    orderId: string,
    assignDeliveryPersonDto: AssignDeliveryPersonDto,
    user: AuthUser,
  ) {    try {
      const { deliveryPersonId } = assignDeliveryPersonDto;

      // Validar que los IDs sean ObjectIds válidos
      if (!Types.ObjectId.isValid(orderId)) {
        throw new BadRequestException('ID de pedido no válido');
      }

      if (!Types.ObjectId.isValid(deliveryPersonId)) {
        throw new BadRequestException('ID de repartidor no válido');
      }      const order = await this.orderModel.findById(orderId);
      const deliveryPerson = await this.userModel.findById(deliveryPersonId);

      if (!order || !deliveryPerson) {
        throw new NotFoundException('Pedido o repartidor no encontrado');
      }

      // Verificar que es repartidor activo
      if (deliveryPerson.role !== 'repartidor' || !deliveryPerson.isActive) {
        throw new BadRequestException('Usuario no es repartidor activo');
      } // Verificar permisos (solo dueño de tienda o presidente)
      const userShop = await this.shopModel.findOne({ ownerId: user._id });
      const isShopOwner =
        userShop && order.shop.toString() === (userShop as any)._id.toString();

      if (!isShopOwner && user.role !== 'presidente') {
        throw new ForbiddenException('No autorizado para asignar repartidores');
      }

      order.deliveryPerson = new Types.ObjectId(deliveryPersonId);
      order.status = 'en_entrega';
      await order.save(); // Notificar al repartidor
      this.ordersGateway.emitToRoom(
        `delivery-${deliveryPersonId}`,
        'order-assigned',
        {
          order,
          message: 'Nuevo pedido asignado',
        },
      );

      // Notificar al cliente
      this.ordersGateway.emitToRoom(
        `client-${order.client}`,
        'order-status-updated',
        {
          orderId: order._id,
          status: 'en_entrega',
          deliveryPerson: deliveryPerson.name,
          message: 'Tu pedido está en camino',
        },
      );

      return { message: 'Repartidor asignado exitosamente' };
    } catch (error) {
      handleExceptions(error, 'el pedido', 'asignar repartidor');
    }
  }  async findPendingOrdersByShopOwner(
    user: AuthUser,
    paginationDto: PaginationDto,
  ) {
    try {
      const { limit = 10, offset, page } = paginationDto;
      const calculatedOffset =
        offset !== undefined ? offset : page ? (page - 1) * limit : 0;

      // Encontrar las tiendas del usuario
      const userObjectId = new Types.ObjectId(user._id.toString());
      const userShops = await this.shopModel.find({ ownerId: userObjectId });

      if (userShops.length === 0) {
        return [];
      }

      const shopIds = userShops.map((shop) => shop._id as Types.ObjectId);

      // Buscar pedidos pendientes solo en las tiendas del usuario
      const query = {
        shop: { $in: shopIds },
        status: { $in: ['pendiente', 'confirmado', 'preparando', 'listo'] },
      };

      const orders = await this.orderModel
        .find(query)
        .populate('client', 'name email')
        .populate('shop', 'name address')
        .populate({
          path: 'items.product',
          select: 'name price images description stock',
          match: { _id: { $exists: true } },
        })
        .populate('deliveryPerson', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(calculatedOffset)
        .exec();

      // Filtrar items con productos null/undefined después del populate
      const cleanedOrders = orders.map((order) => {
        const validItems = order.items.filter(
          (item) => item.product && item.product !== null,
        );
        return {
          ...order.toObject(),
          items: validItems,
        };
      });

      return cleanedOrders;
    } catch (error) {
      console.error('❌ Error finding pending orders:', error);
      handleExceptions(error, 'los pedidos pendientes', 'obtener');
    }
  }
  async findAllOrdersByShopOwner(user: AuthUser, paginationDto: PaginationDto) {
    try {
      const { limit = 50, offset, page } = paginationDto;
      const calculatedOffset =
        offset !== undefined ? offset : page ? (page - 1) * limit : 0;

      // Encontrar las tiendas del usuario
      const userObjectId = new Types.ObjectId(user._id.toString());
      const userShops = await this.shopModel.find({ ownerId: userObjectId });

      if (userShops.length === 0) {
        return [];
      }

      const shopIds = userShops.map((shop) => shop._id as Types.ObjectId);

      // Buscar TODOS los pedidos (todos los status) de las tiendas del usuario
      const query = {
        shop: { $in: shopIds },
      };

      const orders = await this.orderModel
        .find(query)
        .populate('client', 'name email')
        .populate('shop', 'name address')
        .populate('items.product', 'name price images description stock')
        .populate('deliveryPerson', 'name email deliveryInfo')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(calculatedOffset)
        .exec();

      // Filtrar items con productos null/undefined después del populate
      const cleanedOrders = orders.map((order) => {
        const validItems = order.items.filter(
          (item: any) => item.product && item.product !== null,
        );
        return {
          ...order.toObject(),
          items: validItems,
        };
      });

      return cleanedOrders;
    } catch (error) {
      console.error('❌ Error finding all orders:', error);
      handleExceptions(error, 'todos los pedidos', 'obtener');
    }
  }

  private getStatusMessage(status: string): string {
    const messages = {
      pendiente: 'pendiente de confirmación',
      confirmado: 'confirmado',
      preparando: 'en preparación',
      listo: 'listo para entrega',
      en_entrega: 'en camino',
      entregado: 'entregado',
      cancelado: 'cancelado',
    };
    return messages[status] || status;
  }  // Nuevo método para limpiar y validar referencias de productos
  async fixProductReferencesInOrders() {
    try {
      // Buscar todos los pedidos
      const allOrders = await this.orderModel.find({});

      let fixedOrders = 0;
      let removedItems = 0;

      for (const order of allOrders) {
        let orderNeedsUpdate = false;
        const validItems: any[] = [];

        for (const item of order.items) {
          // Verificar si el producto existe
          const productExists = await this.productModel.findById(item.product);

          if (productExists) {
            validItems.push(item);
          } else {
            removedItems++;
            orderNeedsUpdate = true;
          }
        }

        if (orderNeedsUpdate) {
          if (validItems.length > 0) {
            // Actualizar el pedido con solo los items válidos
            await this.orderModel.updateOne(
              { _id: order._id },
              { $set: { items: validItems } },
            );
            fixedOrders++;
          } else {
            // Si no quedan items válidos, marcar el pedido como cancelado
            await this.orderModel.updateOne(
              { _id: order._id },
              { $set: { status: 'cancelado', items: [] } },
            );
            fixedOrders++;
          }
        }
      }

      return { fixedOrders, removedItems };
    } catch (error) {
      console.error('❌ Error durante la limpieza de referencias:', error);
      throw error;
    }
  }

  // Método mejorado para obtener pedidos con productos validados
  private async getOrdersWithValidatedProducts(query: any, options: any = {}) {
    const { populate = [], ...otherOptions } = options;

    // Populate estándar para productos con validación
    const standardPopulate = [
      'client',
      'shop',
      'deliveryPerson',
      {
        path: 'items.product',
        select: 'name price images description stock',
        // Solo incluir productos que realmente existen
        match: { _id: { $exists: true } },
      },
    ];

    const orders = await this.orderModel
      .find(query)
      .populate(standardPopulate)
      .populate(populate)
      .exec();

    // Filtrar items con productos null/undefined después del populate
    const cleanedOrders = orders.map((order) => {
      const validItems = order.items.filter(
        (item) => item.product && item.product !== null,
      );
      return {
        ...order.toObject(),
        items: validItems,
      };
    });

    return cleanedOrders;
  }
}
