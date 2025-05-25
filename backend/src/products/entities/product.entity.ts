import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Schema as MongooseSchema, Document } from 'mongoose';
import { applyToJSONTransform } from 'src/common/helpers/schema-transform.helper';

@Schema({ timestamps: true, versionKey: false })
export class Product extends Document{

  @Prop({ 
        type: Types.ObjectId, 
        ref: 'Shop',
        required: false,
        index: true
    })
    shopId: Types.ObjectId;

  @Prop({ type: String,
    required: true,
        index: true, 
        trim: true
    })
    name: string;

  @Prop({
        type: String,
        trim: true,
        lowercase: true,
    })
    slug: string;

  @Prop({
        trim: true,
        default: '' 
    })
    description: string;

  @Prop({
        type: Number,
        required: true,
        min: 0
    })
    price: number;

  @Prop({
        type: [String],
        default: [],
        index: true
    })
    tags: string[];

  @Prop({
        type: Number,
        min: 0,
        default: null
    })
    calories: number;

  @Prop({
        type: Number,
        min: 0,
        default: 0
    })
    stock: number;

  @Prop({
        type: Number,
        min: 0,
        max: 5,
        default: null
    })
    rating: number;

  images:[
    {
      publicId:{
        type: String,
        required: true,
      },
      url:{
        type: String,
        required: true,
      }
    },
  ];

    reviews: [
        {
          user:{
            userId: MongooseSchema.Types.ObjectId;
            ref: 'User';
            required: true;
          };
          rating: {
            type: Number;
            required: true;
          }
          comment: {
            type: String;
            required: true;
          };
        }
    ];
    user:{
      userId: MongooseSchema.Types.ObjectId;
      ref: 'User';
      required: true;
    };

}

export const ProductSchema = SchemaFactory.createForClass(Product);
// Índice compuesto: slug único *dentro* de cada tienda
// Esto significa que no puede haber dos productos con el mismo slug en la misma tienda, pero sí puede haber el mismo slug en diferentes tiendas.
// Sirve para evitar conflictos de URL y mejorar la búsqueda.
ProductSchema.index({ shopId: 1, slug: 1 }, { unique: true }); // slug único dentro de cada tienda
applyToJSONTransform(ProductSchema);