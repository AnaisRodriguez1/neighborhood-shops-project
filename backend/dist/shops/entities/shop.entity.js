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
exports.ShopSchema = exports.Shop = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const slugify_1 = require("slugify");
const schema_transform_helper_1 = require("../../common/helpers/schema-transform.helper");
let Shop = class Shop extends mongoose_2.Document {
    ownerId;
    name;
    description;
    slug;
    deliveryAvailable;
    pickupAvailable;
    address;
    score;
    totalSales;
    categories;
    isActive;
};
exports.Shop = Shop;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Shop.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        unique: true,
        trim: true,
        required: true,
        lowercase: true
    }),
    __metadata("design:type", String)
], Shop.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: '',
        trim: true
    }),
    __metadata("design:type", String)
], Shop.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String,
        lowercase: true,
        trim: true,
        unique: true,
        index: true }),
    __metadata("design:type", String)
], Shop.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: false
    }),
    __metadata("design:type", Boolean)
], Shop.prototype, "deliveryAvailable", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: true
    }),
    __metadata("design:type", Boolean)
], Shop.prototype, "pickupAvailable", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true
    }),
    __metadata("design:type", String)
], Shop.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 0,
        min: 0
    }),
    __metadata("design:type", Number)
], Shop.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 0,
        min: 0
    }),
    __metadata("design:type", Number)
], Shop.prototype, "totalSales", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        enum: [
            'comida', 'electronica', 'ropa', 'libros', 'hogar',
            'mascotas', 'belleza', 'farmacia', 'papeleria',
            'ferreteria', 'jardineria', 'juguetes', 'deportes', 'otro'
        ],
        required: true,
        index: true,
        lowercase: true,
    }),
    __metadata("design:type", Array)
], Shop.prototype, "categories", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: true
    }),
    __metadata("design:type", Boolean)
], Shop.prototype, "isActive", void 0);
exports.Shop = Shop = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Shop);
exports.ShopSchema = mongoose_1.SchemaFactory.createForClass(Shop);
exports.ShopSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = (0, slugify_1.default)(this.name, {
            lower: true,
            strict: true,
        });
    }
    next();
});
exports.ShopSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
(0, schema_transform_helper_1.applyToJSONTransform)(exports.ShopSchema);
//# sourceMappingURL=shop.entity.js.map