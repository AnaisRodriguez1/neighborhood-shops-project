import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class OrderItemDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsString({ message: 'El ID del producto debe ser un string' })
  productId: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;
}

export class DeliveryAddressDto {
  @IsString({ message: 'La calle debe ser un texto' })
  @IsNotEmpty({ message: 'La calle es obligatoria' })
  street: string;

  @IsString({ message: 'El número debe ser un texto' })
  @IsNotEmpty({ message: 'El número es obligatorio' })
  number: string;

  @IsString({ message: 'El distrito debe ser un texto' })
  @IsNotEmpty({ message: 'El distrito es obligatorio' })
  district: string;

  @IsString({ message: 'La ciudad debe ser un texto' })
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  lng?: number;

  @IsOptional()
  @IsString({ message: 'La referencia debe ser un texto' })
  reference?: string;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'El ID de la tienda es obligatorio' })
  @IsString({ message: 'El ID de la tienda debe ser un string' })
  shopId: string;

  @IsArray({ message: 'Los items deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notes?: string;

  @IsOptional()
  @IsEnum(['efectivo', 'tarjeta', 'billetera_digital'], {
    message: 'El método de pago debe ser: efectivo, tarjeta o billetera_digital'
  })
  paymentMethod?: string;
}
