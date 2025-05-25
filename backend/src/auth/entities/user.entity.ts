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

  @Prop({ type: [String], enum: ['comprador', 'locatario', 'presidente'], default: ['comprador'] })
  roles: string[];

  @Prop({ default: true })
  isActive: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);
applyToJSONTransform(UserSchema);