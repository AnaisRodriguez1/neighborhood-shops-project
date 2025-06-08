import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { applyToJSONTransform } from "src/common/helpers/schema-transform.helper";

@Schema({ timestamps: true })
export class User extends Document{

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;
  
  @Prop({ required: true, select:false})//SELCCT: FALSE 
  // para que no se muestre el password al hacer un find
  password: string;
  @Prop({ type: String, enum: ['comprador', 'locatario', 'presidente', 'repartidor'], default: 'comprador' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  // Información específica para repartidores
  @Prop({
    type: {
      vehicle: {
        type: String,
        enum: ['bicicleta', 'motocicleta', 'auto', 'caminando'],
        default: 'bicicleta'
      },
      isAvailable: {
        type: Boolean,
        default: false
      },
      currentLocation: {
        lat: Number,
        lng: Number
      }
    },
    default: null
  })
  deliveryInfo?: {
    vehicle: string;
    isAvailable: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
}
export const UserSchema = SchemaFactory.createForClass(User);
applyToJSONTransform(UserSchema);