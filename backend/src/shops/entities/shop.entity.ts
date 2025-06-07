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
    address:string;    // Array de exactamente 2 imágenes: [0] = icono, [1] = dashboard
    @Prop({
        type: [String],
        default: [],
        validate: {
            validator: function(images: string[]) {
                // Debe tener exactamente 2 imágenes
                return images.length === 2;
            },
            message: 'La tienda debe tener exactamente 2 imágenes: icono y dashboard'
        }
    })
    images: string[]; // [icono, dashboard]

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

// Métodos helper para acceder a las imágenes
ShopSchema.methods.getIcon = function() {
  return this.images && this.images[0] ? this.images[0] : null;
};

ShopSchema.methods.getDashboard = function() {
  return this.images && this.images[1] ? this.images[1] : null;
};

ShopSchema.methods.setImages = function(iconUrl: string, dashboardUrl: string) {
  this.images = [iconUrl, dashboardUrl];
};

applyToJSONTransform(ShopSchema);