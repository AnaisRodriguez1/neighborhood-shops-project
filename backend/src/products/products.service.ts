import { BadRequestException, Injectable, InternalServerErrorException, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { Auth } from 'src/auth/decorators';

@Injectable()
@Auth()
export class ProductsService {

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    try {

      if(!createProductDto.slug){
        createProductDto.slug = createProductDto.name
        .trim()
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll('-','_')
        .replaceAll("'",'');
      }
      else{
        createProductDto.slug = createProductDto.name
        .trim()
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll('-','_')
        .replaceAll("'",'');
      }

      const product = await this.productModel.create(createProductDto);

      return product;
    } catch (error) {
        handleExceptions(error, 'el producto','crear');
    }
  }

  findAll() {
    return this.productModel.find({});
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if(!product)
      throw new BadRequestException(`Product with id ${id} not found`);
    
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
