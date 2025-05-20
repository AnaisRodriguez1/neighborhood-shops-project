"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const product_entity_1 = require("./entities/product.entity");
const mongoose_2 = require("mongoose");
const exception_handler_helper_1 = require("../common/helpers/exception-handler.helper");
const decorators_1 = require("../auth/decorators");
let ProductsService = class ProductsService {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async create(createProductDto) {
        try {
            if (!createProductDto.slug) {
                createProductDto.slug = createProductDto.name
                    .trim()
                    .toLowerCase()
                    .replaceAll(' ', '_')
                    .replaceAll('-', '_')
                    .replaceAll("'", '')
                    .replaceAll(".", "");
            }
            else {
                createProductDto.slug = createProductDto.name
                    .trim()
                    .toLowerCase()
                    .replaceAll(' ', '_')
                    .replaceAll('-', '_')
                    .replaceAll("'", '')
                    .replaceAll(".", "");
            }
            const product = await this.productModel.create(createProductDto);
            return product;
        }
        catch (error) {
            (0, exception_handler_helper_1.handleExceptions)(error, 'el producto', 'crear');
        }
    }
    findAll(paginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        return this.productModel.find()
            .limit(limit)
            .skip(offset)
            .sort({
            name: 1
        })
            .select('-_id -createdAt -updatedAt');
    }
    async findOne(id) {
        const product = await this.productModel.findById(id);
        if (!product)
            throw new common_1.BadRequestException(`Product with id ${id} not found`);
        return product;
    }
    update(id, updateProductDto) {
        return `This action updates a #${id} product`;
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productModel.findByIdAndDelete(id);
    }
    async deleteAllProducts() {
        try {
            const result = await this.productModel.deleteMany({});
            return { deletedCount: result.deletedCount };
        }
        catch (error) {
            (0, exception_handler_helper_1.handleExceptions)(error);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    (0, decorators_1.Auth)(),
    __param(0, (0, mongoose_1.InjectModel)(product_entity_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map