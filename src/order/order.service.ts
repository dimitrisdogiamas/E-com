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
      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order with items in a transaction
      const order = await this.prisma.$transaction(async (prisma) => {
        // Create the order
        const newOrder = await prisma.order.create({
          data: {
            ...orderData,
            orderNumber,
            userId,
            status: 'PENDING',
          },
        });

        // Create order items
        const orderItems = await Promise.all(
          items.map((item) =>
            prisma.orderItem.create({
              data: {
                orderId: newOrder.id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
              },
            }),
          ),
        );

        return { ...newOrder, items: orderItems };
      });

      // Send email notifications (async, don't block order creation)
      this.sendOrderEmails(order, userId).catch((error) => {
        this.logger.error('Failed to send order emails:', error);
      });

      return order;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw new BadRequestException('Failed to create order');
    }
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

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as $Enums.orderStatus },
    });
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
