import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema, Document } from 'mongoose';
import { applyToJSONTransform } from 'src/common/helpers/schema-transform.helper';

@Schema({ timestamps: true, versionKey: false })
export class Product extends Document{

  @Prop({ 
        type: Types.ObjectId, 
        ref: 'Shop',
        required: true,
        index: true
    })
    shopId: Types.ObjectId;

  @Prop({ type: String, 
        unique: true, 
        index: true, 
        trim: true
    })
    name: string;

  @Prop({
        type: String,
        required: true,
        trim: true
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
        default: null
    })
    imageUrl: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
// Índice compuesto: slug único *dentro* de cada tienda
ProductSchema.index({ shopId: 1, slug: 1 }, { unique: true }); // slug único dentro de cada tienda
applyToJSONTransform(ProductSchema);