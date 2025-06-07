import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, Matches, Min } from "class-validator";
import { Types } from "mongoose";

const CATEGORY_LIST = [
    'comida','electronica','ropa','libros','hogar',
    'mascotas','belleza','farmacia','papeleria',
    'ferreteria','jardineria','juguetes','deportes','otro'
  ] as const;
  type Category = typeof CATEGORY_LIST[number];


export class CreateShopDto {

    @IsString({ message: 'El nombre debe ser un texto.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @Transform(({ value }) =>
      String(value)
        .split(' ')
        .map(
          word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' '),
    )
    name: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser un texto.' })
    description?: string;    

    @IsOptional()
    @IsBoolean({ message: 'La opción de delivery disponible debe ser verdadera o falsa.' })
    deliveryAvailable?: boolean;
  
    @IsOptional()
    @IsBoolean({ message: 'La opción de recoger en tienda debe ser verdadera o falsa.' })
    pickupAvailable?: boolean;

    @IsString({ message: 'La dirección debe ser un texto.' })
    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    address: string;  
  
    @IsOptional()
    @Transform(({ value }) =>
      typeof value === 'string'
        ? value.split(',').map(tag => tag.trim().toLowerCase())
        : value,
    )
    @IsArray({ message: 'Las categorías deben ir separadas por comas.' })
    @IsIn(CATEGORY_LIST, {
      each: true,
      message: `Cada categoría debe ser una de: ${CATEGORY_LIST.join(', ')}.`,
    })
    categories?: Category[];    @IsOptional()
    @IsArray({ message: 'Las imágenes deben ser un array.' })
    @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida.' })
    @Transform(({ value }) => {
      // Si no se proporcionan imágenes, usar array vacío
      if (!value) return [];
      // Si es un string, convertir a array
      if (typeof value === 'string') return [value];
      return value;
    })
    images?: string[]; // [icono, dashboard]
}