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

  async getSupplierProductsWithStock(supplierId: string): Promise<Product[]> {
    const supplierObjectId = new Types.ObjectId(supplierId);
    
    // Get products from supplier that are active and have stock
    return await this.productModel
      .find({ 
        supplierId: supplierObjectId,
        isActive: true
      })
      .select('name description price stock tags calories images slug')
      .exec();
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

    // Get the supplier products and verify they have enough stock
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

    // Validate stock availability
    const stockErrors: string[] = [];
    for (const product of supplierProducts) {
      const requestedQuantity = products.find(p => p.productId === (product._id as any).toString())?.quantity || 0;
      if (product.stock < requestedQuantity) {
        stockErrors.push(`Product ${product.name} has insufficient stock. Available: ${product.stock}, Requested: ${requestedQuantity}`);
      }
    }

    if (stockErrors.length > 0) {
      throw new NotFoundException(`Insufficient stock: ${stockErrors.join(', ')}`);
    }

    const updatedProducts: any[] = [];
    const createdProducts: any[] = [];

    // Process each product
    for (const supplierProduct of supplierProducts) {
      const requestedQuantity = products.find(p => p.productId === (supplierProduct._id as any).toString())?.quantity || 0;
      
      // Check if product already exists in the shop (by supplier product ID and shopId)
      // We'll use the original supplier product ID as a reference
      const existingShopProduct = await this.productModel
        .findOne({ 
          shopId: shopObjectId,
          slug: { $regex: `^${supplierProduct.slug}-shop-${shopId}` } // Check if slug starts with the expected pattern
        })
        .exec();

      if (existingShopProduct) {
        // Product exists in shop, increase stock
        existingShopProduct.stock += requestedQuantity;
        await existingShopProduct.save();
        updatedProducts.push(existingShopProduct);
        console.log(`Updated stock for existing product ${existingShopProduct.name}: +${requestedQuantity}, total: ${existingShopProduct.stock}`);
      } else {
        // Product doesn't exist in shop, create new one with unique slug
        // Generate a more unique slug by adding timestamp if needed
        let uniqueSlug = `${supplierProduct.slug}-shop-${shopId}`;
        
        // Check if this exact slug already exists and make it more unique if necessary
        const existingSlugProduct = await this.productModel.findOne({ 
          shopId: shopObjectId, 
          slug: uniqueSlug 
        }).exec();
        
        if (existingSlugProduct) {
          // If slug already exists, add timestamp to make it unique
          uniqueSlug = `${supplierProduct.slug}-shop-${shopId}-${Date.now()}`;
          console.log(`Slug collision detected, using unique slug: ${uniqueSlug}`);
        }
        
        const newShopProduct = new this.productModel({
          shopId: shopObjectId,
          name: supplierProduct.name,
          description: supplierProduct.description,
          price: supplierProduct.price,
          tags: supplierProduct.tags,
          calories: supplierProduct.calories,
          stock: requestedQuantity,
          images: supplierProduct.images,
          slug: uniqueSlug,
          isActive: true,
        });

        const savedProduct = await newShopProduct.save();
        createdProducts.push(savedProduct);
        console.log(`Created new product ${savedProduct.name} in shop with stock: ${requestedQuantity}, slug: ${savedProduct.slug}`);
      }

      // Reduce stock from supplier product
      supplierProduct.stock -= requestedQuantity;
      await supplierProduct.save();
      console.log(`Reduced supplier stock for ${supplierProduct.name}: -${requestedQuantity}, remaining: ${supplierProduct.stock}`);
    }
    
    return {
      message: `Products processed successfully. Created: ${createdProducts.length}, Updated: ${updatedProducts.length}`,
      created: createdProducts,
      updated: updatedProducts,
      totalProcessed: createdProducts.length + updatedProducts.length
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
