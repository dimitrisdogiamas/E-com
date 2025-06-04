import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchSuggestions {
  products: string[];
  categories: string[];
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProducts(filters: SearchFilters) {
    const { query, category, minPrice, maxPrice } = filters;
    const whereClause: any = {};

    // Text search
    if (query) {
      whereClause.OR = [
        {
          name: {
            contains: query,
          },
        },
        {
          description: {
            contains: query,
          },
        },
      ];
    }

    // Category filter
    if (category && category !== 'All Categories') {
      whereClause.category = {
        equals: category,
      };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) {
        whereClause.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        whereClause.price.lte = maxPrice;
      }
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        variants: {
          include: {
            size: true,
            color: true,
          },
        },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestions> {
    if (!query || query.length < 2) {
      return { products: [], categories: [] };
    }

    // Get product name suggestions
    const products = await this.prisma.product.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
      take: 5,
    });

    // Get unique categories that match
    const categories = await this.prisma.product.findMany({
      where: {
        category: {
          contains: query,
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
      take: 5,
    });

    return {
      products: products.map((p) => p.name),
      categories: categories.map((c) => c.category),
    };
  }

  async getPopularCategories() {
    const categories = await this.prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 10,
    });

    return categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));
  }
}
