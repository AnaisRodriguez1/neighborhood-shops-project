import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { applyToJSONTransform } from 'src/common/helpers/schema-transform.helper';

@Schema({ timestamps: true, versionKey: false })
export class Supplier extends Document {

  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true
  })
  name: string;

  @Prop({
    type: String,
    trim: true,
    default: ''
  })
  description: string;

  @Prop({
    type: String,
    trim: true,
    default: ''
  })
  contactEmail: string;

  @Prop({
    type: String,
    trim: true,
    default: ''
  })
  contactPhone: string;

  @Prop({
    type: String,
    trim: true,
    default: ''
  })
  address: string;

  @Prop({
    type: Boolean,
    default: true
  })
  isActive: boolean;

  @Prop({
    type: [String],
    default: []
  })
  categories: string[];
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
applyToJSONTransform(SupplierSchema);
