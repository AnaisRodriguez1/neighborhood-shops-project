import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<Supplier>,
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
}
