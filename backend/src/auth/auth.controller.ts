import { Controller, Get, Post, Body, UseGuards, Patch, Param} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateDeliveryInfoDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() LoginUserDto:LoginUserDto){
    return this.authService.login(LoginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
  @GetUser() user: User,)
  {
    return this.authService.checkAuthStatus(user);
  }

  @Patch('delivery-info')
  @Auth(ValidRoles.repartidor)
  updateDeliveryInfo(
    @GetUser('id') userId: string,
    @Body() updateDeliveryInfoDto: UpdateDeliveryInfoDto
  ) {
    return this.authService.updateDeliveryInfo(userId, updateDeliveryInfoDto);
  }

  @Get('delivery-persons/available')
  @Auth(ValidRoles.locatario, ValidRoles.presidente)
  getAvailableDeliveryPersons() {
    return this.authService.getAvailableDeliveryPersons();
  }

  @Get('delivery-persons')
  @Auth(ValidRoles.presidente)
  getAllDeliveryPersons() {
    return this.authService.getAllDeliveryPersons();
  }

  @Get('private')
  @RoleProtected(ValidRoles.presidente)
  @UseGuards( AuthGuard(), UserRoleGuard )
  testingPrivateRoute2(
    @GetUser() user: User,
    @GetUser('id') id: string,
    @RawHeaders() rawHeaders: string[],
  ){
    return {
      
      ok: true,
      message: 'Hola Mundo Private',
      user,
      id,
      rawHeaders,
    }
  }
}
