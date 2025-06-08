import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { applyToJSONTransform } from 'src/common/helpers/schema-transform.helper';

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ 
    required: false,  // Changed to false so pre-save hook can handle it
    default: function() {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 9999) + 1;
      return `ORD-${timestamp}-${random.toString().padStart(4, '0')}`;
    }
  })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Shop', required: true, index: true })
  shop: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({
    type: String,
    enum: ['pendiente', 'confirmado', 'preparando', 'listo', 'en_entrega', 'entregado', 'cancelado'],
    default: 'pendiente',
    index: true
  })
  status: string;

  @Prop({
    type: {
      street: { type: String, required: true },
      number: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number
      },
      reference: String
    },
    required: true
  })
  deliveryAddress: {
    street: string;
    number: string;
    district: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    reference?: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deliveryPerson?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ default: 0, min: 0 })
  deliveryFee: number;

  @Prop({ type: Date })
  estimatedDeliveryTime?: Date;

  @Prop({ type: Date })
  actualDeliveryTime?: Date;

  @Prop({ trim: true })
  notes?: string;

  @Prop({
    type: String,
    enum: ['efectivo', 'tarjeta', 'billetera_digital'],
    default: 'efectivo'
  })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: ['pendiente', 'pagado', 'fallido'],
    default: 'pendiente'
  })
  paymentStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Generar número de orden automáticamente mejorado
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber || this.orderNumber.includes('temp')) {
    try {
      const count = await (this.constructor as any).countDocuments();
      const timestamp = Date.now();
      this.orderNumber = `ORD-${timestamp}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      // Fallback if count fails
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 9999) + 1;
      this.orderNumber = `ORD-${timestamp}-${random.toString().padStart(4, '0')}`;
    }
  }
  next();
});

// Índices para mejorar rendimiento
OrderSchema.index({ client: 1, createdAt: -1 });
OrderSchema.index({ shop: 1, status: 1 });
OrderSchema.index({ deliveryPerson: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });

applyToJSONTransform(OrderSchema);
