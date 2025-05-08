import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  // 2 μέθοδος για τα κορυφαία προιόντα ανά κατηγορία
  private async getTopProductsByCategory(categoryId: string) {
    const topProducts = await this.prisma.product.findMany({
      where: {
        category: categoryId, // change the categoryId to category
      },
      include: {
        images: true,
        reviews: true,
        variants: true,
      },
      orderBy: {
        reviews: {
          _count: 'desc', // we change the count to desc
        },
      },
    });
    return topProducts;
  }

  private async getUserPurchasedProducts(userId: string) {
    const userPurchasedProducts = await this.prisma.orderItem.findMany({
      where: {
        order: {
          userId: userId,
        },
      },
      select: {
        variantId: true,
      },
    });
    return userPurchasedProducts;
  }
  // we get the categories of the user's past orders
  private async getUserCategories(userId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          userId: userId,
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
    const uniqueCategories = [
      ...new Set(orderItems.map((item) => item.variant.product.category)),
    ];
    return uniqueCategories;
  }
  // now we need to update the getRecommendationsForUser method
  async getRecommendationsForUser(userId: string, limit: number = 10) {
    try {
      const userCategories = await this.getUserCategories(userId);

      if (userCategories.length === 0) {
        return this.getTopProductsByCategory('all');
      }
      // get purchasded products to exclude
      const purchasedProducts = await this.getUserPurchasedProducts(userId);
      const purchasedVariantIds = purchasedProducts.map((p) => p.variantId);
      //get recommendations from same categories
      return this.prisma.product.findMany({
        where: {
          category: {
            in: userCategories, // fetch the already used categories
          },
          variants: {
            none: {
              id: {
                in: purchasedVariantIds,
              },
            },
          },
        },
        include: {
          images: true,
          reviews: true,
          variants: true,
        },
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
        take: limit, // limit the number of recommendations
      });
    } catch (error) {
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }
  }
}
