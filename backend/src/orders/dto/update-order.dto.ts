import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['pendiente', 'confirmado', 'preparando', 'listo', 'en_entrega', 'entregado', 'cancelado'], {
    message: 'El estado debe ser: pendiente, confirmado, preparando, listo, en_entrega, entregado o cancelado'
  })
  status: string;

  @IsOptional()
  @IsDateString({}, { message: 'El tiempo estimado de entrega debe ser una fecha válida' })
  estimatedDeliveryTime?: string;
}

export class AssignDeliveryPersonDto {
  @IsString({ message: 'El ID del repartidor debe ser un string' })
  deliveryPersonId: string;
}
