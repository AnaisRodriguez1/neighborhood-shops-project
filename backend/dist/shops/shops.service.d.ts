import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { Model } from 'mongoose';
export declare class ShopsService {
    private readonly shopModel;
    constructor(shopModel: Model<Shop>);
    create(createShopDto: CreateShopDto): Promise<(import("mongoose").Document<unknown, {}, Shop, {}> & Shop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | undefined>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateShopDto: UpdateShopDto): string;
    remove(id: number): string;
}
