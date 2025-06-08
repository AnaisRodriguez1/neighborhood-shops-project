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
  }  findAll(paginationDto : PaginationDto) {

    const { limit = this.defaultLimit, offset, page } = paginationDto;

    // Calculate offset: use provided offset or calculate from page
    const calculatedOffset = offset !== undefined ? offset : (page ? (page - 1) * limit : this.defaultOffset);

    return this.productModel.find()
      .limit( limit )
      .skip( calculatedOffset )
      .sort({
        name:1
      })
      .populate('shopId', 'name _id')
      .select('-createdAt -updatedAt')
  }
  async findByShopId(shopId: string, paginationDto: PaginationDto) {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException(`'${shopId}' no es un ObjectId válido.`);
    }

    const { limit = this.defaultLimit, offset, page } = paginationDto;
    const calculatedOffset = offset !== undefined ? offset : (page ? (page - 1) * limit : this.defaultOffset);

    return this.productModel.find({ shopId })
      .limit(limit)
      .skip(calculatedOffset)
      .sort({ name: 1 })
      .select('-createdAt -updatedAt');
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if(!product)
      throw new BadRequestException(`Product with id ${id} not found`);
    
    return product;
  }
  async update(id: string, updateProductDto: UpdateProductDto) {
    console.log('=== PRODUCTS SERVICE UPDATE ===');
    console.log('ID received:', id);
    console.log('DTO received:', JSON.stringify(updateProductDto, null, 2));
    
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`El ID '${id}' no es válido.`);
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`No se encontró un producto con ID '${id}'.`);
    }

    console.log('Product found:', product.toObject());

    // ❌ Protege campos que NO deben ser actualizados
    delete (updateProductDto as any).slug;
    delete (updateProductDto as any).shopId;
    delete (updateProductDto as any).rating;
    delete (updateProductDto as any).reviews;
    
    console.log('DTO after cleanup:', JSON.stringify(updateProductDto, null, 2));    // ✅ Aplica campos actualizables
    Object.assign(product, updateProductDto);
    
    console.log('Product after Object.assign:', product.toObject());

    try {
      const result = await product.save(); // mantiene hooks como el de slug si cambia name
      console.log('Product saved successfully:', result.toObject());
      console.log('=== END PRODUCTS SERVICE UPDATE ===');
      return result;
    } catch (error) {
      console.log('Error saving product:', error);
      console.log('=== END PRODUCTS SERVICE UPDATE (ERROR) ===');
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

  async adminRemove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`'${id}' no es un ObjectId válido.`);
    }

    try {
      const product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException(`Producto con ID '${id}' no encontrado.`);
      }

      await this.productModel.findByIdAndDelete(id);

      return { 
        message: `Producto '${product.name}' eliminado permanentemente por administrador.` 
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleExceptions(error, 'el producto', 'eliminar');
    }
  }
}
