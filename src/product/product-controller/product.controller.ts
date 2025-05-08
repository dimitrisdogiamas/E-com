import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from '../product-service/product.service';
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //Post
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createProduct(
    @Body()
    body: {
      name: string;
      description: string;
      price: number;
      category: string;
    },
  ) {
    return this.productService.createProduct(body);
  }
  //Get all products
  @Get()
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  //Get product by id
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  //Update product
  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
    },
  ) {
    return this.productService.updateProduct(id, body);
  }

  //Delete product
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
