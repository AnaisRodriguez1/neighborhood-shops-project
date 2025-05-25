import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Shop } from './entities/shop.entity';
import { Model } from 'mongoose';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { Auth } from 'src/auth/decorators';

@Injectable()
@Auth()
export class ShopsService {

  constructor(
    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>
  )
  {}
  
  async create(createShopDto: CreateShopDto) {
    try {
      const shop = await this.shopModel.create(createShopDto);
      return shop;
    } catch (error) {
      handleExceptions(error,'la tienda','crear');
    }
  }

  findAll() {
    return `This action returns all shops`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shop`;
  }

  update(id: number, updateShopDto: UpdateShopDto) {
    return `This action updates a #${id} shop`;
  }

  remove(id: number) {
    return `This action removes a #${id} shop`;
  }
}
