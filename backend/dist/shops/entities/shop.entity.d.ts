import { Document, Types } from "mongoose";
export declare class Shop extends Document {
    ownerId: Types.ObjectId;
    name: string;
    description: string;
    slug: string;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    address: string;
    score: number;
    totalSales: number;
    categories: string[];
    isActive: boolean;
}
export declare const ShopSchema: import("mongoose").Schema<Shop, import("mongoose").Model<Shop, any, any, any, Document<unknown, any, Shop, any> & Shop & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Shop, Document<unknown, {}, import("mongoose").FlatRecord<Shop>, {}> & import("mongoose").FlatRecord<Shop> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
