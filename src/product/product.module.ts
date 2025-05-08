import { Module } from '@nestjs/common';
import { ProductService } from './product-service/product.service';
import { ProductController } from './product-controller/product.controller';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  providers: [ProductService, PrismaService],
  controllers: [ProductController],
})
export class ProductModule {}
