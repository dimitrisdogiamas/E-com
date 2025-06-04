import { Module } from '@nestjs/common';
import { ProductService } from './product-service/product.service';
import { ProductController } from './product-controller/product.controller';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ProductService, ReviewService, PrismaService],
  controllers: [ProductController, ReviewController],
  exports: [ProductService, ReviewService],
})
export class ProductModule {}
