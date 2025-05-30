import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    category: string;
  }) {
    return this.prisma.product.create({
      data,
    });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      include: {
        images: true, // we include the images in the product
      },
    });
  }

  //getProductById
  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: {
          include: {
            size: true,
            color: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with the id ${id} not found`);
    }
    return product;
  }

  //updateProduct
  async updateProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
    },
  ) {
    //check if the product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    //if not, throw an error
    if (!existingProduct) {
      throw new NotFoundException(`Product not found ${id} not found`);
    }
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  //delete product
  async deleteProduct(id: string) {
    // we need to check if the product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    await this.prisma.product.delete({
      where: { id },
    });
    return {
      success: true,
      message: `Product with id ${id} deleted successfully`,
    };
  }
}
