import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalProducts = await this.prisma.product.count();
    const totalOrders = await this.prisma.order.count();
    const totalRevenue = await this.prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const pendingOrders = await this.prisma.order.count({
      where: { status: 'PENDING' },
    });

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
    };
  }

  // User Management
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count();

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // Legacy method for backward compatibility
  async getUsers(page = 1, limit = 10) {
    return this.getAllUsers(page, limit);
  }

  // Product Management
  async getAllProducts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const products = await this.prisma.product.findMany({
      skip,
      take: limit,
      include: {
        images: true,
        variants: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.product.count();

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // Legacy method for backward compatibility
  async getProducts(page = 1, limit = 10) {
    return this.getAllProducts(page, limit);
  }

  // Order Management
  async getAllOrders(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const orders = await this.prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.order.count();

    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // Legacy method for backward compatibility
  async getOrders(page = 1, limit = 10) {
    return this.getAllOrders(page, limit);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as $Enums.orderStatus },
    });
  }

  // Review Management & Moderation
  async getAllReviews(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const reviews = await this.prisma.review.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.review.count();

    return {
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async moderateReview(reviewId: string, status: 'approved' | 'rejected') {
    // For now, we'll just update a custom field or delete if rejected
    if (status === 'rejected') {
      return this.deleteReview(reviewId);
    }

    // If approved, we could add a status field to the review model
    // For now, just return the review as is
    return this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteReview(reviewId: string) {
    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
