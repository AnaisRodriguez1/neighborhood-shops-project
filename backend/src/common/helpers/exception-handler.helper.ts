import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export function handleExceptions(
  error: any,
  entityName: string = 'recurso',
  operation: string = 'procesar'
) {
  // Error de duplicado en Mongo (índice único)
  if (error.code === 11000) {
    throw new BadRequestException(
      `No se pudo ${operation} ${entityName}: ya existe un registro duplicado.`
    );
  }

  console.error(error);

  // Excepción genérica
  throw new InternalServerErrorException(
    `Ocurrió un error al ${operation} ${entityName}.`
  );
}
