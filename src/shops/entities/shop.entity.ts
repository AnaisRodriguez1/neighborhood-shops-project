import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { applyToJSONTransform } from "src/common/helpers/schema-transform.helper";

@Schema({timestamps:true})
export class Shop extends Document {

    @Prop({
        type: Types.ObjectId,
        ref :'User',
    })
    ownerId: Types.ObjectId;

    @Prop({
        unique:true,
        trim:true,
        required:true
    })
    name:string;

    @Prop({
        default:true
    })
    description:string;

    @Prop({
        default:true
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

    @Prop({
        default:0,
        min:0
    })
    score: number;

    @Prop({
        default:0,
        min:0
    })
    totalSales: number;

    @Prop({
        type:[String],
        default:[]
    })
    categories:string[];

    @Prop({
        default:true
    })
    isActive:boolean;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);

applyToJSONTransform(ShopSchema);