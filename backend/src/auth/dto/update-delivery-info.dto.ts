import { IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateDeliveryInfoDto {
  @IsOptional()
  @IsEnum(['bicicleta', 'motocicleta', 'auto', 'caminando'], {
    message: 'El vehículo debe ser: bicicleta, motocicleta, auto o caminando'
  })
  vehicle?: string;

  @IsOptional()
  @IsBoolean({ message: 'La disponibilidad debe ser verdadero o falso' })
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  lng?: number;
}
