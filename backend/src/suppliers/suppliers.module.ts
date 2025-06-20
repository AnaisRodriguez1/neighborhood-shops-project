import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier, SupplierSchema } from './entities/supplier.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Supplier.name,
        schema: SupplierSchema,
      }
    ]),
    AuthModule,
  ],
  exports: [
    MongooseModule,
    SuppliersService
  ]
})
export class SuppliersModule {}
