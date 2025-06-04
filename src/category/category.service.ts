// TEMPORARILY DISABLED - Category Service
// This service is disabled to avoid database migration complexity
// All code is preserved and can be re-enabled when ready for migration

/*
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories(includeInactive = false, hierarchy = false) {
    const where = includeInactive ? {} : { isActive: true };
    
    if (hierarchy) {
      // Return hierarchical structure with parent/children relationships
      const categories = await this.prisma.category.findMany({
        where: { ...where, parentId: null }, // Only root categories
        include: {
          children: {
            where,
            include: {
              children: {
                where,
                orderBy: { sortOrder: 'asc' },
              },
              _count: { select: { products: true } },
            },
            orderBy: { sortOrder: 'asc' },
          },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });
      return categories;
    }

    // Return flat structure
    return this.prisma.category.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getCategoryProducts(categoryId: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;

    // Get category and all its children IDs for recursive product search
    const category = await this.getCategoryById(categoryId);
    const categoryIds = [categoryId];
    
    // Add children category IDs
    if (category.children.length > 0) {
      categoryIds.push(...category.children.map(child => child.id));
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { categoryId: { in: categoryIds } },
        include: {
          images: true,
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({
        where: { categoryId: { in: categoryIds } },
      }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      category,
    };
  }

  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    // Generate slug from name
    const slug = this.generateSlug(data.name);

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: {
        ...data,
        slug,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    const category = await this.getCategoryById(id);

    // Generate new slug if name is being updated
    const slug = data.name ? this.generateSlug(data.name) : undefined;

    // Validate parent exists if provided and not the same as current category
    if (data.parentId && data.parentId !== id) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    // Prevent setting parent to self or descendant
    if (data.parentId === id) {
      throw new BadRequestException('Category cannot be parent of itself');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(slug && { slug }),
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          select: { id: true, name: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);

    // Check if category has products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${productCount} products. Move products to another category first.`,
      );
    }

    // Check if category has children
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${childrenCount} subcategories. Move or delete subcategories first.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
*/

// Placeholder service to avoid module errors
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {
  // Temporarily disabled - all methods preserved above in comments
} 