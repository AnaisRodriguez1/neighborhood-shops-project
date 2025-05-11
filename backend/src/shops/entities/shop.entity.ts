import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import slugify from "slugify";
import { applyToJSONTransform } from "src/common/helpers/schema-transform.helper";

@Schema({timestamps:true})
export class Shop extends Document {

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      })
    ownerId: Types.ObjectId;

    @Prop({
        unique: true,
        trim: true,
        required: true,
        lowercase: true
    })    
    name:string;

    @Prop({
        default: '',
        trim: true
    })
    description: string;

    @Prop({ type: String, 
        lowercase: true, 
        trim: true, 
        unique: true, 
        index: true })
    slug: string;

    //DEFAULT FALSE POR SI A LA PERSONA SE LE OLVIDÓ
    // Y NO TIENE DELIVERY
    @Prop({
        default:false
    })
    deliveryAvailable:boolean;

    @Prop({
        default:true
    })
    pickupAvailable:boolean;

    @Prop({
        required:true,
        trim:true
    })
    address:string;

//NO EN FORMULARIO
    @Prop({
        default:0,
        min:0
    })
    score: number;
//NO EN FORMULARIO
    @Prop({
        default:0,
        min:0
    })
    totalSales: number;

    
    @Prop({
        type: [String],
        enum: [
          'comida','electronica','ropa','libros','hogar',
          'mascotas','belleza','farmacia','papeleria',
          'ferreteria','jardineria','juguetes','deportes','otro'
        ],
        required: true,
        index: true,
        lowercase: true,
      })
      categories: string[];      
//NO EN FORMULARIO
    @Prop({
        default:true
    })
    isActive:boolean;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
// Hook que genera el slug automáticamente
ShopSchema.pre<Shop>('save', function(next) {
    // Sólo recalcula si cambió el nombre
    if (this.isModified('name')) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,   // elimina caracteres no alfanuméricos
      });
    }
    next();
  });
  
ShopSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
applyToJSONTransform(ShopSchema);