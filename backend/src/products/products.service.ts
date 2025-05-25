import { BadRequestException, Injectable, InternalServerErrorException, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { handleExceptions } from 'src/common/helpers/exception-handler.helper';
import { Auth } from 'src/auth/decorators';
import { PaginationDto } from '../common/dtos/pagination.dto';

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

    const {limit =10, offset = 0} = paginationDto;

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

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productModel.findByIdAndDelete(id);
  }

  async deleteAllProducts() {
  try {
    const result = await this.productModel.deleteMany({});
    // result.deletedCount tiene el número de documentos eliminados
    return { deletedCount: result.deletedCount };
  } catch (error) {
    handleExceptions(error);
  }
}
  
}
