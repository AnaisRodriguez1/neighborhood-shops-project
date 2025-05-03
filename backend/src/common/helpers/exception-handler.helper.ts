import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export function handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`This Object ${JSON.stringify(error.keyValue)} exists in BD`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create this Object - Check Server logs`)
  }