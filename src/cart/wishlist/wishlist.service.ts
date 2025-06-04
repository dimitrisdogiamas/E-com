import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // Add to wishlist
  async addToWishList(userId: string, productId: string) {
    // Check if already in wishlist
    const existing = await this.prisma.wishListItem.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      throw new Error('Product already in wishlist');
    }

    return this.prisma.wishListItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });
  }

  // Remove from wishlist
  async removeFromWishList(userId: string, productId: string) {
    return this.prisma.wishListItem.deleteMany({
      where: { userId, productId },
    });
  }

  // Get user's wishlist
  async getWishList(userId: string) {
    return this.prisma.wishListItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });
  }
}
