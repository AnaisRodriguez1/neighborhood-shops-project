import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, AssignDeliveryPersonDto } from './dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { ParseObjectIdPipe } from 'src/common/helpers/pipes/parse-object-id.pipe';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AuthUser } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}  @Post()
  @Auth(ValidRoles.comprador, ValidRoles.presidente)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: AuthUser,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @Auth(ValidRoles.presidente)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }  @Get('my-orders')
  @Auth(ValidRoles.comprador, ValidRoles.presidente)
  findMyOrders(
    @GetUser() user: AuthUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findByClient(user._id.toString(), paginationDto);
  }

  @Get('shop/:shopId')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  findByShop(
    @Param('shopId', ParseObjectIdPipe) shopId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findByShop(shopId, paginationDto);
  }

  @Get('delivery-person/:deliveryPersonId')
  @Auth(ValidRoles.repartidor, ValidRoles.presidente)
  findByDeliveryPerson(
    @Param('deliveryPersonId', ParseObjectIdPipe) deliveryPersonId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findByDeliveryPerson(deliveryPersonId, paginationDto);
  }
  @Get('my-deliveries')
  @Auth(ValidRoles.repartidor)
  findMyDeliveries(
    @GetUser() user: AuthUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findByDeliveryPerson(user._id.toString(), paginationDto);
  }
  @Get('my-deliveries/all')
  @Auth(ValidRoles.repartidor)
  findAllMyDeliveries(
    @GetUser() user: AuthUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findAllDeliveriesByDeliveryPerson(user._id.toString(), paginationDto);
  }  @Get('my-shop-orders/pending')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  findMyShopPendingOrders(
    @GetUser() user: AuthUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findPendingOrdersByShopOwner(user, paginationDto);
  }
  @Get('my-shop-orders/all')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  findAllMyShopOrders(
    @GetUser() user: AuthUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findAllOrdersByShopOwner(user, paginationDto);
  }

  @Get('available-for-delivery')
  @Auth(ValidRoles.repartidor)
  findAvailableForDelivery(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findAvailableForDelivery(paginationDto);
  }

  @Patch('take-order/:orderId')
  @Auth(ValidRoles.repartidor)
  takeOrder(
    @Param('orderId', ParseObjectIdPipe) orderId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.ordersService.takeOrder(orderId, user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ordersService.findOne(id);
  }
  @Patch(':orderId/status')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  updateStatus(
    @Param('orderId', ParseObjectIdPipe) orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetUser() user: AuthUser,
  ) {
    return this.ordersService.updateStatus(orderId, updateOrderStatusDto, user);
  }

  @Post('fix-product-references')
  @Auth(ValidRoles.presidente)
  fixProductReferences() {
    return this.ordersService.fixProductReferencesInOrders();
  }

  @Patch(':orderId/assign-delivery')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  assignDeliveryPerson(
    @Param('orderId', ParseObjectIdPipe) orderId: string,
    @Body() assignDeliveryPersonDto: AssignDeliveryPersonDto,
    @GetUser() user: AuthUser,
  ) {
    return this.ordersService.assignDeliveryPerson(orderId, assignDeliveryPersonDto, user);
  }

  @Patch(':orderId/delivery-status')
  @Auth(ValidRoles.repartidor)
  updateDeliveryStatus(
    @Param('orderId', ParseObjectIdPipe) orderId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.ordersService.updateDeliveryStatus(orderId, user);
  }

  @Get('diagnostics/orphaned-orders')
  @Auth(ValidRoles.presidente)
  findOrphanedOrders() {
    return this.ordersService.findOrphanedOrders();
  }

  @Patch('diagnostics/fix-orphaned-orders')
  @Auth(ValidRoles.presidente)
  fixOrphanedOrders() {
    return this.ordersService.fixOrphanedOrders();
  }

  @Post('fix-objectids')
  @Auth(ValidRoles.presidente)
  async fixObjectIds() {
    return this.ordersService.fixObjectIdFields();
  }
}
