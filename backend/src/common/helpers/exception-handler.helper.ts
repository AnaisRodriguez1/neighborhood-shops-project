import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export function handleExceptions(error: any) {
  if (error.code === 11000) {
    throw new BadRequestException('El correo ya está registrado.');
  }
  console.error(error);
  throw new InternalServerErrorException('No se pudo procesar la solicitud - Revisa los logs del servidor.');
}
