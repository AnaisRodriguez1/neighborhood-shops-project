import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model, Types } from 'mongoose';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { Auth } from 'src/auth/decorators';
import { PaginationDto } from '../common/dtos/pagination.dto';


@Injectable()
@Auth()
export class ProductsService {

  private defaultLimit: number;
  private defaultOffset: number;

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    private readonly configService : ConfigService,
    
  ){
    this.defaultLimit = this.configService.get<number>('defaultLimit') || 10;
    this.defaultOffset = this.configService.get<number>('defaultOffset') || 0;
  }

  async create(createProductDto: CreateProductDto) {
    try {

      if(!createProductDto.slug){
        createProductDto.slug = createProductDto.name
        .trim()
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll('-','_')
        .replaceAll("'",'')
        .replaceAll(".","")
      }
      else{
        createProductDto.slug = createProductDto.name
        .trim()
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll('-','_')
        .replaceAll("'",'')
        .replaceAll(".","")
      }

      const product = await this.productModel.create(createProductDto);

      return product;
    } catch (error) {
        handleExceptions(error, 'el producto','crear');
    }
  }

  findAll(paginationDto : PaginationDto) {

    const { limit = this.defaultLimit, offset = this.defaultOffset } = paginationDto;

    return this.productModel.find()
      .limit( limit )
      .skip( offset )
      .sort({
        name:1
      })
      .select('-_id -createdAt -updatedAt')
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if(!product)
      throw new BadRequestException(`Product with id ${id} not found`);
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`El ID '${id}' no es válido.`);
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`No se encontró un producto con ID '${id}'.`);
    }

    // ❌ Protege campos que NO deben ser actualizados
    delete (updateProductDto as any).slug;
    delete (updateProductDto as any).shopId;
    delete (updateProductDto as any).rating;
    delete (updateProductDto as any).reviews;

    // ✅ Aplica campos actualizables
    Object.assign(product, updateProductDto);

    try {
      return await product.save(); // mantiene hooks como el de slug si cambia name
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`Ya existe otro producto con datos similares.`);
      }
      handleExceptions(error, 'el producto', 'actualizar');
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productModel.findByIdAndDelete(id);
  }
}
