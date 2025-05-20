import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { PaginationDto } from '../common/dtos/pagination.dto';
export declare class ProductsService {
    private readonly productModel;
    constructor(productModel: Model<Product>);
    create(createProductDto: CreateProductDto): Promise<(import("mongoose").Document<unknown, {}, Product, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | undefined>;
    findAll(paginationDto: PaginationDto): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Product, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, Product, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, Product, "find", {}>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Product, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, updateProductDto: UpdateProductDto): string;
    remove(id: string): Promise<void>;
    deleteAllProducts(): Promise<{
        deletedCount: number;
    } | undefined>;
}
