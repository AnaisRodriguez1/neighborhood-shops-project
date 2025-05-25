import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
@Injectable()
export class SeedService {

  private readonly axios : AxiosInstance = axios;

  constructor (
    @InjectModel(Product.name)
    private readonly productService : ProductsService
  ){}

  async executeSeed() {
    await this.productService.deleteAllProducts()

    return 'Seed Executed';
  }
}
