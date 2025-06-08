import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto, AssignDeliveryPersonDto } from './dto';
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
      const { shopId, items, deliveryAddress, notes, paymentMethod } = createOrderDto;
      const clientId = user._id;

      // Verificar que la tienda existe
      const shop = await this.shopModel.findById(shopId);
      if (!shop) {
        throw new NotFoundException('Tienda no encontrada');
      }      // Calcular total y verificar productos
      let totalAmount = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`
          );
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price
        });

        // Actualizar stock
        product.stock -= item.quantity;
        await product.save();
      }      // Crear pedido
      const order = new this.orderModel({
        client: clientId,
        shop: shopId,
        items: orderItems,
        deliveryAddress: {
          ...deliveryAddress,
          coordinates: deliveryAddress.lat && deliveryAddress.lng 
            ? { lat: deliveryAddress.lat, lng: deliveryAddress.lng }
            : undefined
        },
        totalAmount,
        notes,
        paymentMethod: paymentMethod || 'efectivo',
        status: 'pendiente'
      });

      await order.save();
      await order.populate(['client', 'shop', 'items.product']);      // Notificar a la tienda vía WebSocket
      this.ordersGateway.emitToRoom(`shop-${shopId}`, 'new-order', {
        order,
        message: 'Nuevo pedido recibido'
      });

      // Notificar al cliente
      this.ordersGateway.emitToRoom(`client-${clientId}`, 'order-created', {
        order,
        message: 'Pedido creado exitosamente'
      });

      return {
        message: 'Pedido creado exitosamente',
        order
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
      .populate('items.product', 'name price')
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return orders;
  }  async findByClient(clientId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException(`'${clientId}' no es un ObjectId válido.`);
    }

    console.log('🔍 Finding orders for client:', clientId);

    // Fix any client fields that are stored as strings instead of ObjectId
    try {
      const clientObjectId = new Types.ObjectId(clientId);
      
      // First, fix any orders where client is stored as string
      const updateResult = await this.orderModel.updateMany(
        { client: clientId }, // Find orders where client is a string
        { $set: { client: clientObjectId } } // Convert to ObjectId
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`🔧 Fixed ${updateResult.modifiedCount} orders with string client field`);
      }
      
      // Debug: Show all orders with their client field types
      const allOrders = await this.orderModel.find({});
      console.log('🔍 All orders client field debug:', allOrders.map(order => ({
        id: order._id,
        client: order.client,
        clientType: typeof order.client
      })));

      // Use both string and ObjectId queries to ensure we find all orders
      const orders = await this.orderModel
        .find({
          $or: [
            { client: clientObjectId },
            { client: clientId } // Also search for string version just in case
          ]
        })
        .populate('shop', 'name address')
        .populate('deliveryPerson', 'name email')
        .populate('items.product', 'name price')
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      console.log(`📦 Found ${orders.length} orders for client ${clientId}`);
      return orders;
      
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
      .populate('items.product', 'name price')
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return orders;
  }

  async findByDeliveryPerson(deliveryPersonId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    if (!Types.ObjectId.isValid(deliveryPersonId)) {
      throw new BadRequestException(`'${deliveryPersonId}' no es un ObjectId válido.`);
    }

    const orders = await this.orderModel
      .find({ deliveryPerson: deliveryPersonId })
      .populate('client', 'name email')
      .populate('shop', 'name address')
      .populate('items.product', 'name price')
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return orders;
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
      .populate('items.product', 'name price')
      .exec();

    if (!order) {
      throw new NotFoundException(`No se encontró un pedido con ID '${id}'.`);
    }

    return order;
  }
  async updateStatus(
    orderId: string, 
    updateOrderStatusDto: UpdateOrderStatusDto, 
    user: AuthUser
  ) {
    try {
      const { status, estimatedDeliveryTime } = updateOrderStatusDto;

      const order = await this.orderModel
        .findById(orderId)
        .populate(['client', 'shop', 'deliveryPerson']);

      if (!order) {
        throw new NotFoundException('Pedido no encontrado');
      }      // Verificar permisos
      const userShop = await this.shopModel.findOne({ ownerId: user._id });
      const isShopOwner = userShop && order.shop._id.toString() === userShop.id.toString();
      const isDeliveryPerson = user.role === 'repartidor' && 
        order.deliveryPerson?._id.toString() === user._id.toString();

      if (!isShopOwner && !isDeliveryPerson && user.role !== 'presidente') {
        throw new ForbiddenException('No autorizado para actualizar este pedido');
      }

      order.status = status;
      if (estimatedDeliveryTime) {
        order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
      }

      if (status === 'entregado') {
        order.actualDeliveryTime = new Date();
      }

      await order.save();      // Notificar cambios vía WebSocket
      this.ordersGateway.emitToRoom(`client-${order.client._id}`, 'order-status-updated', {
        orderId: order._id,
        status,
        message: `Tu pedido está ${this.getStatusMessage(status)}`
      });

      if (order.deliveryPerson) {
        this.ordersGateway.emitToRoom(`delivery-${order.deliveryPerson._id}`, 'order-status-updated', {
          orderId: order._id,
          status
        });
      }

      return {
        message: 'Estado actualizado exitosamente',
        order
      };

    } catch (error) {
      handleExceptions(error, 'el pedido', 'actualizar');
    }
  }
  async assignDeliveryPerson(
    orderId: string, 
    assignDeliveryPersonDto: AssignDeliveryPersonDto,
    user: AuthUser
  ) {
    try {
      const { deliveryPersonId } = assignDeliveryPersonDto;

      const order = await this.orderModel.findById(orderId);
      const deliveryPerson = await this.userModel.findById(deliveryPersonId);

      if (!order || !deliveryPerson) {
        throw new NotFoundException('Pedido o repartidor no encontrado');
      }

      // Verificar que es repartidor activo
      if (deliveryPerson.role !== 'repartidor' || !deliveryPerson.isActive) {
        throw new BadRequestException('Usuario no es repartidor activo');
      }      // Verificar permisos (solo dueño de tienda o presidente)
      const userShop = await this.shopModel.findOne({ ownerId: user._id });
      const isShopOwner = userShop && order.shop.toString() === userShop.id.toString();

      if (!isShopOwner && user.role !== 'presidente') {
        throw new ForbiddenException('No autorizado para asignar repartidores');
      }

      order.deliveryPerson = new Types.ObjectId(deliveryPersonId);
      order.status = 'en_entrega';
      await order.save();      // Notificar al repartidor
      this.ordersGateway.emitToRoom(`delivery-${deliveryPersonId}`, 'order-assigned', {
        order,
        message: 'Nuevo pedido asignado'
      });

      // Notificar al cliente
      this.ordersGateway.emitToRoom(`client-${order.client}`, 'order-status-updated', {
        orderId: order._id,
        status: 'en_entrega',
        deliveryPerson: deliveryPerson.name,
        message: 'Tu pedido está en camino'
      });

      return { message: 'Repartidor asignado exitosamente' };

    } catch (error) {
      handleExceptions(error, 'el pedido', 'asignar repartidor');
    }
  }  async findPendingOrdersByShopOwner(user: AuthUser, paginationDto: PaginationDto) {
    try {
      console.log('🔍 Finding pending orders for shop owner:', user._id);
      console.log('🔍 User ID type:', typeof user._id, 'Value:', user._id);
      
      const { limit = 10, offset, page } = paginationDto;
      const calculatedOffset = offset !== undefined ? offset : (page ? (page - 1) * limit : 0);

      // Primero, encontrar las tiendas del usuario
      const userObjectId = new Types.ObjectId(user._id.toString());
      console.log('🔍 Searching for shops with ownerId:', userObjectId);
      
      const userShops = await this.shopModel.find({ ownerId: userObjectId });
      console.log('🏪 User shops found:', userShops.length);
      
      if (userShops.length > 0) {
        console.log('🏪 Shop IDs found:', userShops.map(shop => ({ id: shop._id, name: shop.name })));
      }
      
      if (userShops.length === 0) {
        // Verificar si existen tiendas con este usuario
        const allShops = await this.shopModel.find({});
        console.log('🔍 All shops in DB:', allShops.map(shop => ({ 
          id: shop._id, 
          name: shop.name, 
          ownerId: shop.ownerId 
        })));
        return [];
      }      const shopIds = userShops.map(shop => shop._id as Types.ObjectId);
      const shopIdStrings = userShops.map(shop => (shop._id as Types.ObjectId).toString());
      console.log('🔍 Looking for orders in shops (ObjectId):', shopIds);
      console.log('🔍 Looking for orders in shops (String):', shopIdStrings);

      // ARREGLAR DATOS: Convertir shop strings a ObjectId
      console.log('🔧 Fixing shop field data types...');
      await this.orderModel.updateMany(
        { shop: { $type: "string" } },
        [{ $set: { shop: { $toObjectId: "$shop" } } }]
      );
      console.log('✅ Shop field data types fixed');

      // Buscar pedidos pendientes - usando $or para manejar ambos tipos por si acaso
      const query = { 
        $or: [
          { shop: { $in: shopIds } },
          { shop: { $in: shopIdStrings } }
        ],
        status: { $in: ['pendiente', 'confirmado', 'preparando', 'listo'] }
      };
      console.log('🔍 Query for orders:', JSON.stringify(query, null, 2));
      
      const orders = await this.orderModel
        .find(query)
        .populate('client', 'name email')
        .populate('shop', 'name address')
        .populate('items.product', 'name price images')
        .populate('deliveryPerson', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(calculatedOffset)
        .exec();

      console.log('📦 Found pending orders:', orders.length);
      
      // Always show all orders for debugging
      const allOrders = await this.orderModel.find({});
      console.log('🔍 All orders in DB:', allOrders.map(order => ({
        id: order._id,
        shop: order.shop,
        shopType: typeof order.shop,
        status: order.status,
        client: order.client
      })));
      
      // Show orders specifically in our target shops
      const ordersInOurShops = await this.orderModel.find({ 
        $or: [
          { shop: { $in: shopIds } },
          { shop: { $in: shopIdStrings } }
        ]
      });
      console.log('🔍 All orders in our shops (any status):', ordersInOurShops.map(order => ({
        id: order._id,
        shop: order.shop,
        shopType: typeof order.shop,
        status: order.status,
        client: order.client
      })));
      
      return orders;
    } catch (error) {
      console.error('❌ Error finding pending orders:', error);
      handleExceptions(error, 'los pedidos pendientes', 'obtener');
    }
  }

  private getStatusMessage(status: string): string {
    const messages = {
      'pendiente': 'pendiente de confirmación',
      'confirmado': 'confirmado',
      'preparando': 'en preparación',
      'listo': 'listo para entrega',
      'en_entrega': 'en camino',
      'entregado': 'entregado',
      'cancelado': 'cancelado'
    };
    return messages[status] || status;
  }
}
