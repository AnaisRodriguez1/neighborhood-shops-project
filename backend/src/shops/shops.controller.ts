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
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ParseObjectIdPipe } from '../common/helpers/pipes/parse-object-id.pipe';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { AuthUser } from './shops.service'; // 👈 usa la interfaz que definimos en el service

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}
  @Post()
  @Auth(ValidRoles.locatario)
  create(
    @Body() createShopDto: CreateShopDto,
    @GetUser() user: AuthUser,
  ) {
    return this.shopsService.create(createShopDto, user);
  }
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.shopsService.findAll(paginationDto);
  }

  @Get('admin/metrics')
  @Auth(ValidRoles.presidente)
  getAdminMetrics() {
    return this.shopsService.getAdminMetrics();
  }

  @Get('id/:id')
  findOneById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.shopsService.findOne(id);
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.shopsService.findOneBySlug(slug);
  }

  @Patch(':id')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateShopDto: UpdateShopDto,
    @GetUser() user: AuthUser,
  ) {
    return this.shopsService.update(id, updateShopDto, user);
  }
  @Delete(':id')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.shopsService.remove(id, user);
  }

  @Delete('admin/:id')
  @Auth(ValidRoles.presidente)
  adminRemove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.shopsService.adminRemove(id);
  }

  @Delete('delete-all')
  @Auth(ValidRoles.presidente)
  deleteAllShops() {
    return this.shopsService.deleteAllShops();
  }

  @Get('owner/:ownerId')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  findByOwner(@Param('ownerId', ParseObjectIdPipe) ownerId: string) {
    return this.shopsService.findByOwner(ownerId);
  }

  @Get('my-shops')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  findMyShops(@GetUser() user: AuthUser) {
    return this.shopsService.findByOwner(user._id.toString());
  }
}
