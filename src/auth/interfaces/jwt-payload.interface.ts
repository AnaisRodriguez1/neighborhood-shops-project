import { mongo } from "mongoose";

export interface JwtPayload {
    id:mongo.ObjectId
    
    //TODO: añadir todo lo que quieran grabar.
}