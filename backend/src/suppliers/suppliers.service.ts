import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<Supplier>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(Shop.name)
    private readonly shopModel: Model<Shop>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = new this.supplierModel(createSupplierDto);
    return await supplier.save();
  }

  async findAll(): Promise<Supplier[]> {
    return await this.supplierModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id).exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.supplierModel
      .findByIdAndUpdate(id, updateSupplierDto, { new: true })
      .exec();
    
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async remove(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async findByCategory(category: string): Promise<Supplier[]> {
    return await this.supplierModel
      .find({ 
        categories: { $in: [category] },
        isActive: true 
      })
      .exec();
  }

  async getSupplierProducts(supplierId: string): Promise<Product[]> {
    console.log('Getting products for supplier:', supplierId);
    console.log('Supplier ID type:', typeof supplierId);
    
    // Convert to ObjectId for proper comparison
    const ObjectId = require('mongoose').Types.ObjectId;
    let searchId;
    
    try {
      searchId = new ObjectId(supplierId);
      console.log('Converted to ObjectId:', searchId);
    } catch (error) {
      console.log('Could not convert to ObjectId, using string:', supplierId);
      searchId = supplierId;
    }
    
    // For now, we'll get products that have the supplier ID in their metadata
    const products = await this.productModel
      .find({ supplierId: searchId })
      .exec();
    
    console.log('Found products:', products.length);
    if (products.length > 0) {
      console.log('First product:', products[0]);
    }
    return products;
  }

  async addProductsToShop(supplierId: string, shopId: string, productIds: string[]): Promise<any> {
    // Verify supplier exists
    const supplier = await this.findOne(supplierId);
    
    // Verify shop exists
    const shop = await this.shopModel.findById(shopId).exec();
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    // Get the supplier products
    const supplierProducts = await this.productModel
      .find({ 
        _id: { $in: productIds },
        supplierId: supplierId 
      })
      .exec();

    if (supplierProducts.length !== productIds.length) {
      throw new NotFoundException('Some products not found or do not belong to this supplier');
    }

    // Create new products for the shop based on supplier products
    const shopProducts = supplierProducts.map(product => ({
      shopId: shopId,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      calories: product.calories,
      stock: 0, // Start with 0 stock, shop owner will update
      images: product.images,
      slug: `${product.slug}-shop-${shopId}`, // Make slug unique for shop
      // Keep reference to original supplier product
      originalSupplierId: supplierId,
      isActive: true,
    }));

    const createdProducts = await this.productModel.insertMany(shopProducts);
    
    return {
      message: `${createdProducts.length} products added to shop successfully`,
      products: createdProducts
    };
  }

  async getSupplierShops(supplierId: string): Promise<Shop[]> {
    // Get shops that have products from this supplier
    const productsBySupplier = await this.productModel
      .find({ supplierId: supplierId })
      .distinct('shopId')
      .exec();

    return await this.shopModel
      .find({ _id: { $in: productsBySupplier } })
      .exec();
  }

  async toggleSupplierRelationship(supplierId: string, shopId: string, isWorking: boolean): Promise<any> {
    // Verify supplier exists
    const supplier = await this.findOne(supplierId);
    
    // Verify shop exists
    const shop = await this.shopModel.findById(shopId).exec();
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    if (isWorking) {
      // Start working relationship - this could create a relationship record
      // For now, we'll just return a success message
      return {
        message: `Shop ${shop.name} is now working with supplier ${supplier.name}`,
        supplierId,
        shopId,
        isWorking: true
      };
    } else {
      // Stop working relationship - deactivate products from this supplier in the shop
      await this.productModel
        .updateMany(
          { supplierId: supplierId, shopId: shopId },
          { isActive: false }
        )
        .exec();

      return {
        message: `Shop ${shop.name} stopped working with supplier ${supplier.name}`,
        supplierId,
        shopId,
        isWorking: false
      };
    }
  }
}
