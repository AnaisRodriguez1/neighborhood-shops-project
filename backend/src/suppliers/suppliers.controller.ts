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
import { Types } from 'mongoose';

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

  @Get(':id/products')
  @Auth(ValidRoles.locatario)
  getSupplierProducts(@Param('id') id: string) {
    return this.suppliersService.getSupplierProducts(id);
  }

  @Post(':id/add-to-shop/:shopId')
  @Auth(ValidRoles.locatario)
  addProductsToShop(
    @Param('id') supplierId: string,
    @Param('shopId') shopId: string,
    @Body() body: { products: { productId: string; quantity: number }[] }
  ) {
    console.log('=== ADD PRODUCTS TO SHOP ROUTE HIT ===');
    console.log('Supplier ID:', supplierId);
    console.log('Shop ID:', shopId);
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('========================================');
    
    // Convert shopId to ObjectId to validate it's a valid ObjectId
    const shopObjectId = new Types.ObjectId(shopId);
    
    return this.suppliersService.addProductsToShop(supplierId, shopObjectId.toString(), body.products);
  }

  @Get(':id/shops')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  getSupplierShops(@Param('id') id: string) {
    return this.suppliersService.getSupplierShops(id);
  }

  @Patch(':id/relationship/:shopId')
  @Auth(ValidRoles.locatario)
  toggleSupplierRelationship(
    @Param('id') supplierId: string,
    @Param('shopId') shopId: string,
    @Body() body: { isWorking: boolean }
  ) {
    // Convert shopId to ObjectId to validate it's a valid ObjectId
    const shopObjectId = new Types.ObjectId(shopId);
    
    return this.suppliersService.toggleSupplierRelationship(supplierId, shopObjectId.toString(), body.isWorking);
  }

  @Get(':id/products-with-stock')
  @Auth(ValidRoles.locatario)
  getSupplierProductsWithStock(@Param('id') id: string) {
    return this.suppliersService.getSupplierProductsWithStock(id);
  }
}
