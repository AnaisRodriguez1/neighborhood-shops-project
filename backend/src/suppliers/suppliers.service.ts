import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async addProductsToShop(supplierId: string, shopId: string, products: { productId: string; quantity: number }[]): Promise<any> {
    console.log('=== ADD PRODUCTS TO SHOP SERVICE ===');
    console.log('Supplier ID:', supplierId);
    console.log('Shop ID:', shopId);
    console.log('Products to add:', products);

    // Verify supplier exists
    const supplier = await this.findOne(supplierId);
    console.log('Supplier found:', supplier.name);
    
    // Convert shopId to ObjectId for database operations
    const shopObjectId = new Types.ObjectId(shopId);
    
    // Verify shop exists
    const shop = await this.shopModel.findById(shopObjectId).exec();
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }
    console.log('Shop found:', shop.name);

    // Extract product IDs from the products array and convert to ObjectIds
    const productObjectIds = products.map(p => new Types.ObjectId(p.productId));
    console.log('Product IDs to add:', productObjectIds);

    // Convert supplier ID to ObjectId for proper comparison
    const supplierObjectId = new Types.ObjectId(supplierId);
    console.log('Converted supplier ID to ObjectId:', supplierObjectId);

    // Get the supplier products
    const supplierProducts = await this.productModel
      .find({ 
        _id: { $in: productObjectIds },
        supplierId: supplierObjectId 
      })
      .exec();

    console.log('Found supplier products:', supplierProducts.length);
    console.log('Expected product count:', productObjectIds.length);

    if (supplierProducts.length === 0) {
      // Check if products exist at all
      const anyProducts = await this.productModel
        .find({ _id: { $in: productObjectIds } })
        .exec();
      console.log('Products found (any supplier):', anyProducts.length);
      
      if (anyProducts.length > 0) {
        console.log('Sample product supplierId:', anyProducts[0].supplierId);
        console.log('Expected supplierId:', supplierObjectId);
      }
    }

    if (supplierProducts.length !== productObjectIds.length) {
      throw new NotFoundException('Some products not found or do not belong to this supplier');
    }

    // Create new products for the shop based on supplier products with specified quantities
    const shopProducts = supplierProducts.map(product => {
      // Find the corresponding quantity for this product
      const productInfo = products.find(p => p.productId === (product._id as any).toString());
      const quantity = productInfo ? productInfo.quantity : 0;

      return {
        shopId: shopObjectId, // Use ObjectId instead of string
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        calories: product.calories,
        stock: quantity, // Use the specified quantity as initial stock
        images: product.images,
        slug: `${product.slug}-shop-${shopId}`, // Make slug unique for shop
        // Keep reference to original supplier product
        originalSupplierId: supplierObjectId,
        isActive: true,
      };
    });

    const createdProducts = await this.productModel.insertMany(shopProducts);
    
    return {
      message: `${createdProducts.length} products added to shop successfully`,
      products: createdProducts
    };
  }

  async getSupplierShops(supplierId: string): Promise<Shop[]> {
    // Convert supplier ID to ObjectId
    const supplierObjectId = new Types.ObjectId(supplierId);
    
    // Get shops that have products from this supplier
    const productsBySupplier = await this.productModel
      .find({ supplierId: supplierObjectId })
      .distinct('shopId')
      .exec();

    return await this.shopModel
      .find({ _id: { $in: productsBySupplier } })
      .exec();
  }

  async toggleSupplierRelationship(supplierId: string, shopId: string, isWorking: boolean): Promise<any> {
    // Convert IDs to ObjectIds
    const supplierObjectId = new Types.ObjectId(supplierId);
    const shopObjectId = new Types.ObjectId(shopId);
    
    // Verify supplier exists
    const supplier = await this.findOne(supplierId);
    
    // Verify shop exists
    const shop = await this.shopModel.findById(shopObjectId).exec();
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
          { supplierId: supplierObjectId, shopId: shopObjectId },
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
