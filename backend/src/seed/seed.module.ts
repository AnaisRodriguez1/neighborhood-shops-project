import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';


@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports:[ 
    AuthModule,
    ProductsModule,
   ],
})
export class SeedModule {}
