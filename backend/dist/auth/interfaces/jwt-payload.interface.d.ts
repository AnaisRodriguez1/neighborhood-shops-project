import { mongo } from "mongoose";
export interface JwtPayload {
    id: mongo.ObjectId;
}
