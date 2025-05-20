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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = exports.Product = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schema_transform_helper_1 = require("../../common/helpers/schema-transform.helper");
let Product = class Product extends mongoose_2.Document {
    shopId;
    name;
    slug;
    description;
    price;
    tags;
    calories;
    stock;
    rating;
    images;
    reviews;
    user;
};
exports.Product = Product;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Shop',
        required: false,
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Product.prototype, "shopId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String,
        required: true,
        index: true,
        trim: true
    }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        trim: true,
        lowercase: true,
    }),
    __metadata("design:type", String)
], Product.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        trim: true,
        default: ''
    }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        required: true,
        min: 0
    }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
        index: true
    }),
    __metadata("design:type", Array)
], Product.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        min: 0,
        default: null
    }),
    __metadata("design:type", Number)
], Product.prototype, "calories", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        min: 0,
        default: 0
    }),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        min: 0,
        max: 5,
        default: null
    }),
    __metadata("design:type", Number)
], Product.prototype, "rating", void 0);
exports.Product = Product = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, versionKey: false })
], Product);
exports.ProductSchema = mongoose_1.SchemaFactory.createForClass(Product);
exports.ProductSchema.index({ shopId: 1, slug: 1 }, { unique: true });
(0, schema_transform_helper_1.applyToJSONTransform)(exports.ProductSchema);
//# sourceMappingURL=product.entity.js.map