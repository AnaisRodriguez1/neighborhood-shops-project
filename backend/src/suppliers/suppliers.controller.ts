import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}
  @Post()
  @Auth(ValidRoles.presidente, ValidRoles.locatario)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @Auth()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get('category/:category')
  @Auth()
  findByCategory(@Param('category') category: string) {
    return this.suppliersService.findByCategory(category);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }
  @Patch(':id')
  @Auth(ValidRoles.presidente, ValidRoles.locatario)
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }
  @Delete(':id')
  @Auth(ValidRoles.presidente)
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
