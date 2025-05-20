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
exports.CreateProductDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateProductDto {
    name;
    slug;
    description;
    price;
    tags;
    calories;
    stock;
    images;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser un texto.' }),
    (0, class_validator_1.MinLength)(1, { message: 'El nombre es obligatorio.' }),
    (0, class_validator_1.MaxLength)(100, { message: 'El nombre no puede exceder los 100 caracteres.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Las etiquetas deben ser un texto.' }),
    (0, class_validator_1.MinLength)(1, { message: 'Las etiquetas son obligatorias.' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Las etiquetas no pueden exceder los 100 caracteres.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser un texto.' }),
    (0, class_validator_1.MaxLength)(300, { message: 'La descripción no puede exceder los 300 caracteres.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El precio debe ser un número.' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0, { message: 'El precio no puede ser negativo.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string'
        ? value.split(',').map(tag => tag.trim()).filter(tag => tag)
        : value),
    (0, class_validator_1.IsArray)({ message: 'Las etiquetas deben ir separadas por comas.' }),
    (0, class_validator_1.ArrayNotEmpty)({ message: 'Si incluyes tags, no pueden estar vacías.' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Cada etiqueta debe ser un texto.' }),
    (0, class_validator_1.MaxLength)(50, { each: true, message: 'Cada etiqueta no puede exceder 50 caracteres.' }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Las calorías deben ser un número.' }),
    (0, class_validator_1.Min)(0, { message: 'Las calorías no pueden ser negativas.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "calories", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El stock debe ser un número.' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0, { message: 'El stock no puede ser negativo.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La URL de la imagen debe ser un texto.' }),
    (0, class_validator_1.IsUrl)({}, { message: 'La URL de la imagen debe ser válida.' }),
    (0, class_validator_1.MaxLength)(500, { message: 'La URL de la imagen no puede exceder 500 caracteres.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "images", void 0);
//# sourceMappingURL=create-product.dto.js.map