import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsMongoId, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength, Matches } from "class-validator";

export class CreateProductDto {

    @IsOptional()
    @IsString({ message: 'El ID de la tienda debe ser un texto.' })
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'El ID de la tienda debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales).' })
    shopId?: string;

    @IsString({ message: 'El nombre debe ser un texto.' })
    @MinLength(1, { message: 'El nombre es obligatorio.' })
    @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres.' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Las etiquetas deben ser un texto.' })
    @MinLength(1, { message: 'Las etiquetas son obligatorias.' })
    @MaxLength(100, { message: 'Las etiquetas no pueden exceder los 100 caracteres.' })
    slug?: string;
 
    @IsOptional()
    @IsString({ message: 'La descripción debe ser un texto.' })
    @MaxLength(300, { message: 'La descripción no puede exceder los 300 caracteres.' })
    description?: string;

    @IsNumber({}, { message: 'El precio debe ser un número.' })
    @Type(()=> Number)
    @Min(0, { message: 'El precio no puede ser negativo.' })
    price: number;

    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string'
          ? value.split(',').map(tag => tag.trim()).filter(tag => tag)
          : value,
      )
    @IsArray({ message: 'Las etiquetas deben ir separadas por comas.' })
    @ArrayNotEmpty({ message: 'Si incluyes tags, no pueden estar vacías.' })
    @IsString({ each: true, message: 'Cada etiqueta debe ser un texto.' })
    @MaxLength(50, { each: true, message: 'Cada etiqueta no puede exceder 50 caracteres.' })
    tags?: string[];

    @IsOptional()
    @Type(()=> Number)
    @IsNumber({}, { message: 'Las calorías deben ser un número.' })
    @Min(0, { message: 'Las calorías no pueden ser negativas.' })
    calories?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El stock debe ser un número.' })
    @Type(()=> Number)
    @Min(0, { message: 'El stock no puede ser negativo.' })
    stock?: number;

    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string'
          ? value.split(',').map(url => url.trim()).filter(url => url)
          : value,
      )
    @IsArray({ message: 'Las imágenes deben ir separadas por comas.' })
    @IsString({ each: true, message: 'Cada URL de imagen debe ser un texto.' })
    @IsUrl({}, { each: true, message: 'Cada URL de imagen debe ser válida.' })
    @MaxLength(500, { each: true, message: 'Cada URL de imagen no puede exceder 500 caracteres.' })
    images?: string[];

}
