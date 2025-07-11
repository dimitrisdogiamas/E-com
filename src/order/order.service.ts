import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { $Enums } from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    const { items, ...orderData } = createOrderDto;

    try {
      // First, validate stock availability for all items
      await this.validateStockAvailability(items);

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order and update stock in a single transaction
      const transactionOperations = [];

      // 1. Create the main order
      const orderCreateOperation = this.prisma.order.create({
        data: {
          ...orderData,
          orderNumber,
          userId,
          status: 'PENDING',
        },
      });
      transactionOperations.push(orderCreateOperation);

      // 2. Update stock for each variant (decrement)
      items.forEach((item) => {
        const stockUpdateOperation = this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
        transactionOperations.push(stockUpdateOperation);
      });

      // Execute all operations in a single transaction
      const [newOrder] = await this.prisma.$transaction(transactionOperations);

      // 3. Create order items after the main transaction succeeds
      const orderItems = await Promise.all(
        items.map((item) =>
          this.prisma.orderItem.create({
            data: {
              orderId: newOrder.id,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            },
          }),
        ),
      );
      // this returns the new order and the order items
      const completeOrder = { ...newOrder, items: orderItems };

      this.logger.log(`
        ✅ Order ${orderNumber} created successfully with stock updates
        ${JSON.stringify(completeOrder)}`);

      // Send email notifications (async, don't block order creation)
      this.sendOrderEmails(completeOrder, userId).catch((error) => {
        this.logger.error('Failed to send order emails:', error);
      });

      return completeOrder;
    } catch (error) {
      this.logger.error('Order creation failed:', error);
      // Handle specific error types
      if (error.message.includes('Insufficient stock')) {
        throw new BadRequestException(error.message);
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('One or more product variants not found');
      }
      throw new BadRequestException('Failed to create order: ' + error.message);
    }
  }

  private async validateStockAvailability(items: any[]) {
    this.logger.log('🔍 Validating stock availability for order items');
    const stockChecks = await Promise.all(
      items.map(async (item) => {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            id: true,
            stock: true,
            sku: true,
            product: {
              select: { name: true },
            },
          },
        });

        if (!variant) {
          throw new Error(`Product variant not found: ${item.variantId}`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${variant.product.name} (${variant.sku}). Available: ${variant.stock}, Requested: ${item.quantity}`,
          );
        }

        return {
          variantId: item.variantId,
          sku: variant.sku,
          available: variant.stock,
          requested: item.quantity,
        };
      }),
    );

    this.logger.log(`
      ✅ Stock validation passed for ${stockChecks.length} items
      ${JSON.stringify(stockChecks)}`);
    return stockChecks;
  }

  // Utility method to check stock for a single variant
  async checkVariantStock(variantId: string): Promise<{
    variantId: string;
    stock: number;
    sku: string;
    productName: string;
  }> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        sku: true,
        product: {
          select: { name: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Product variant not found: ${variantId}`);
    }

    return {
      variantId: variant.id,
      stock: variant.stock,
      sku: variant.sku,
      productName: variant.product.name,
    };
  }

  private async sendOrderEmails(order: any, userId: string) {
    try {
      // Get user and order details for email
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (!user) {
        this.logger.warn(`User not found for order ${order.orderNumber}`);
        return;
      }

      // Get order items with product details
      const orderWithItems = await this.prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { name: true },
                  },
                  size: { select: { name: true } },
                  color: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      if (!orderWithItems) {
        this.logger.warn(`Order details not found for ${order.orderNumber}`);
        return;
      }

      // Prepare email data
      const emailData = {
        orderNumber: order.orderNumber,
        customerName: user.name,
        customerEmail: user.email,
        totalAmount: order.totalAmount,
        items: orderWithItems.items.map((item) => ({
          name: `${item.variant.product.name} (${item.variant.size.name}, ${item.variant.color.name})`,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: `${order.shippingFullName}\n${order.shippingAddress}\n${order.shippingPhone}`,
      };

      // Send customer confirmation email
      const customerEmailSent =
        await this.emailService.sendOrderConfirmation(emailData);
      if (customerEmailSent) {
        this.logger.log(`✅ Order confirmation email sent to ${user.email}`);
      }

      // Send admin notification email
      const adminEmailSent =
        await this.emailService.sendAdminOrderNotification(emailData);
      if (adminEmailSent) {
        this.logger.log(`
          ✅ Admin notification email sent for order ${order.orderNumber}`);
      }
    } catch (error) {
      this.logger.error('Error sending order emails:', error);
    }
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
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
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses: $Enums.orderStatus[] = [
      'PENDING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status as $Enums.orderStatus)) {
      throw new BadRequestException('Invalid order status');
    }

    // Get current order to check if we need to restock
    const currentOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!currentOrder) {
      throw new NotFoundException('Order not found');
    }

    // If cancelling an order, we need to restock the items
    if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
      await this.restockOrderItems(currentOrder.items);
      this.logger.log(
        `🔄 Restocked items for cancelled order ${currentOrder.orderNumber}`,
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as $Enums.orderStatus },
    });
  }

  private async restockOrderItems(orderItems: any[]) {
    this.logger.log('🔄 Restocking items for cancelled order');
    const restockOperations = orderItems.map((item) =>
      this.prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      }),
    );

    await this.prisma.$transaction(restockOperations);
    this.logger.log(`✅ Successfully restocked ${orderItems.length} items`);
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `NB${year}${month}${day}`;

    // Get count of orders created today
    const startOfDay = new Date(year, today.getMonth(), today.getDate());
    const endOfDay = new Date(year, today.getMonth(), today.getDate() + 1);
    const todayOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const orderNumber = `${prefix}${String(todayOrdersCount + 1).padStart(4, '0')}`;
    return orderNumber;
  }
}
