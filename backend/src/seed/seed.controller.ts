import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(ValidRoles.presidente)
  executeSeed() {
    return this.seedService.executeSeed();
  }

  @Get('bootstrap')
  // No Auth decorator for initial bootstrapping
  bootstrapSeed() {
    return this.seedService.executeSeed();
  }

  @Get('delivery-persons')
  @Auth(ValidRoles.presidente)
  seedDeliveryPersons() {
    return this.seedService.seedDeliveryPersons();
  }

  @Get('orders')
  @Auth(ValidRoles.presidente)
  seedOrders() {
    return this.seedService.seedOrders();
  }

  @Delete('users')
  @Auth(ValidRoles.presidente)
  clearUsers() {
    return this.seedService.clearUsers();
  }
}