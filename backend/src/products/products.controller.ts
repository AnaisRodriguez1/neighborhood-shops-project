import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { ParseObjectIdPipe } from 'src/common/helpers/pipes/parse-object-id.pipe';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() paginationDto : PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get('shop/:shopId')
  findByShopId(@Param('shopId', ParseObjectIdPipe) shopId: string, @Query() paginationDto : PaginationDto) {
    return this.productsService.findByShopId(shopId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.findOne(id);
  }
  @Patch(':id')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    console.log('=== UPDATE PRODUCT DEBUG ===');
    console.log('Product ID:', id);
    console.log('Update DTO:', JSON.stringify(updateProductDto, null, 2));
    console.log('DTO type:', typeof updateProductDto);
    console.log('============================');
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.remove(id);
  }
}
