import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    console.log('getCart called with userId:', userId);

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Find or create cart for user
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
                size: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      console.log('Creating new cart for userId:', userId);
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                  size: true,
                  color: true,
                },
              },
            },
          },
        },
      });
    }

    // Calculate total
    const total = cart.items.reduce(
      (sum, item) =>
        sum +
        (item.variant.price || item.variant.product.price) * item.quantity,
      0,
    );

    return {
      id: cart.id,
      items: cart.items,
      total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addToCart(userId: string, variantId: string, quantity: number) {
    console.log('CartService.addToCart called with:', {
      userId,
      variantId,
      quantity,
    });

    // Get or create cart
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      console.log('Creating new cart for userId:', userId);
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, variantId: string, quantity: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, variantId);
    }

    await this.prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        variantId,
      },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, variantId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }
}
