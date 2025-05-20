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
exports.CreateShopDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const CATEGORY_LIST = [
    'comida', 'electronica', 'ropa', 'libros', 'hogar',
    'mascotas', 'belleza', 'farmacia', 'papeleria',
    'ferreteria', 'jardineria', 'juguetes', 'deportes', 'otro'
];
class CreateShopDto {
    name;
    description;
    deliveryAvailable;
    pickupAvailable;
    address;
    categories;
}
exports.CreateShopDto = CreateShopDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser un texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es obligatorio.' }),
    (0, class_transformer_1.Transform)(({ value }) => String(value)
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')),
    __metadata("design:type", String)
], CreateShopDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser un texto.' }),
    __metadata("design:type", String)
], CreateShopDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'La opción de delivery disponible debe ser verdadera o falsa.' }),
    __metadata("design:type", Boolean)
], CreateShopDto.prototype, "deliveryAvailable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'La opción de recoger en tienda debe ser verdadera o falsa.' }),
    __metadata("design:type", Boolean)
], CreateShopDto.prototype, "pickupAvailable", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser un texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La dirección es obligatoria.' }),
    __metadata("design:type", String)
], CreateShopDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string'
        ? value.split(',').map(tag => tag.trim().toLowerCase())
        : value),
    (0, class_validator_1.IsArray)({ message: 'Las categorías deben ir separadas por comas.' }),
    (0, class_validator_1.IsIn)(CATEGORY_LIST, {
        each: true,
        message: `Cada categoría debe ser una de: ${CATEGORY_LIST.join(', ')}.`,
    }),
    __metadata("design:type", Array)
], CreateShopDto.prototype, "categories", void 0);
//# sourceMappingURL=create-shop.dto.js.map