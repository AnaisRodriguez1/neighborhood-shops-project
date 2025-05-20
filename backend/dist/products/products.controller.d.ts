import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<(import("mongoose").Document<unknown, {}, import("./entities/product.entity").Product, {}> & import("./entities/product.entity").Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | undefined>;
    findAll(paginationDto: PaginationDto): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("./entities/product.entity").Product, {}> & import("./entities/product.entity").Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./entities/product.entity").Product, {}> & import("./entities/product.entity").Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("./entities/product.entity").Product, "find", {}>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/product.entity").Product, {}> & import("./entities/product.entity").Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, updateProductDto: UpdateProductDto): string;
    remove(id: string): Promise<void>;
}
