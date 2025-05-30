import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // add to wishList
  async addToWishList(userId: string, productId: string) {
    return this.prisma.wishListItem.create({
      data: { userId, productId },
    });
  }

  // remove from wishList
  async removeFromWishList(userId: string, productId: string) {
    return this.prisma.wishListItem.deleteMany({
      where: { userId, productId },
    });
  }
  // get the wishList from the user
  async getWishList(userId: string) {
    return this.prisma.wishListItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });
  }
}
