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
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const shop_entity_1 = require("./entities/shop.entity");
const mongoose_2 = require("mongoose");
const exception_handler_helper_1 = require("../common/helpers/exception-handler.helper");
const decorators_1 = require("../auth/decorators");
let ShopsService = class ShopsService {
    shopModel;
    constructor(shopModel) {
        this.shopModel = shopModel;
    }
    async create(createShopDto) {
        try {
            const shop = await this.shopModel.create(createShopDto);
            return shop;
        }
        catch (error) {
            (0, exception_handler_helper_1.handleExceptions)(error, 'la tienda', 'crear');
        }
    }
    findAll() {
        return `This action returns all shops`;
    }
    findOne(id) {
        return `This action returns a #${id} shop`;
    }
    update(id, updateShopDto) {
        return `This action updates a #${id} shop`;
    }
    remove(id) {
        return `This action removes a #${id} shop`;
    }
};
exports.ShopsService = ShopsService;
exports.ShopsService = ShopsService = __decorate([
    (0, common_1.Injectable)(),
    (0, decorators_1.Auth)(),
    __param(0, (0, mongoose_1.InjectModel)(shop_entity_1.Shop.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ShopsService);
//# sourceMappingURL=shops.service.js.map