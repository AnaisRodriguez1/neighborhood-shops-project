import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";
import { Types } from "mongoose";

export class CreateShopDto {
    @IsNotEmpty()
    @IsString()
    ownerId: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '))
    name:string;

    @IsOptional()
    @IsString()
    description?:string;

    @IsOptional()
    @IsBoolean()
    deliveryAvailable?: boolean;
  
    @IsOptional()
    @IsBoolean()
    pickupAvailable?: boolean;

    @IsNotEmpty()
    @IsString()
    address: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    @IsPositive()
    score?: number;
  
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(0)
    totalSales?: number;
  
    @IsOptional()
    @IsArray()
    categories?: string[];
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}