import mongoose, { Types, Schema as MongooseSchema, Document } from 'mongoose';
export declare class Product extends Document {
    shopId: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    price: number;
    tags: string[];
    calories: number;
    stock: number;
    rating: number;
    images: [
        {
            publicId: {
                type: String;
                required: true;
            };
            url: {
                type: String;
                required: true;
            };
        }
    ];
    reviews: [
        {
            user: {
                userId: MongooseSchema.Types.ObjectId;
                ref: 'User';
                required: true;
            };
            rating: {
                type: Number;
                required: true;
            };
            comment: {
                type: String;
                required: true;
            };
        }
    ];
    user: {
        userId: MongooseSchema.Types.ObjectId;
        ref: 'User';
        required: true;
    };
}
export declare const ProductSchema: mongoose.Schema<Product, mongoose.Model<Product, any, any, any, mongoose.Document<unknown, any, Product, any> & Product & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Product, mongoose.Document<unknown, {}, mongoose.FlatRecord<Product>, {}> & mongoose.FlatRecord<Product> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
