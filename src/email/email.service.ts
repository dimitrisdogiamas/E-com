import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    try {
      const template = this.generateOrderConfirmationTemplate(orderData);
      return await this.sendEmail(template);
    } catch (error) {
      this.logger.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
    try {
      const template = this.generateWelcomeTemplate(userData);
      return await this.sendEmail(template);
    } catch (error) {
      this.logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendAdminOrderNotification(
    orderData: OrderEmailData,
  ): Promise<boolean> {
    try {
      const template = this.generateAdminOrderTemplate(orderData);
      // Send to admin email
      template.to =
        this.configService.get<string>('ADMIN_EMAIL') || 'admin@nextbuy.com';
      return await this.sendEmail(template);
    } catch (error) {
      this.logger.error('Failed to send admin notification:', error);
      return false;
    }
  }

  private async sendEmail(template: EmailTemplate): Promise<boolean> {
    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Mailgun
    // For now, we'll simulate sending and log the email
    this.logger.log(`📧 EMAIL SENT:`);
    this.logger.log(`To: ${template.to}`);
    this.logger.log(`Subject: ${template.subject}`);
    this.logger.log(`Content: ${template.text || 'HTML content'}`);
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }

  private generateOrderConfirmationTemplate(
    data: OrderEmailData,
  ): EmailTemplate {
    const itemsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #1976d2; margin: 0;">NextBuy</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">Order #${data.orderNumber}</h3>
            <p style="margin: 0; color: #666;">Total: <strong>$${data.totalAmount.toFixed(2)}</strong></p>
          </div>
          
          <h3>Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <h3>Shipping Address:</h3>
          <p style="background: #f8f9fa; padding: 15px; border-radius: 8px;">${data.shippingAddress}</p>
          
          <p>We'll send you a shipping confirmation email with tracking information once your order ships.</p>
          
          <p>Best regards,<br>The NextBuy Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 NextBuy. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Confirmation - NextBuy

Dear ${data.customerName},

Thank you for your order! We've received your order #${data.orderNumber} and are preparing it for shipment.

Order Total: $${data.totalAmount.toFixed(2)}

Items:
${data.items.map((item) => `- ${item.name} (${item.quantity}x) - $${(item.quantity * item.price).toFixed(2)}`).join('\n')}

Shipping Address:
${data.shippingAddress}

Best regards,
The NextBuy Team
    `;

    return {
      to: data.customerEmail,
      subject: `Order Confirmation - #${data.orderNumber}`,
      html,
      text,
    };
  }

  private generateWelcomeTemplate(data: WelcomeEmailData): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to NextBuy</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1976d2; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to NextBuy!</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Hi ${data.name}! 👋</h2>
          <p>Welcome to NextBuy - your destination for amazing products and great deals!</p>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <h3 style="color: #1976d2; margin: 0 0 10px 0;">Get Started</h3>
            <p style="margin: 0;">Explore our products, create your wishlist, and enjoy shopping!</p>
          </div>
          
          <h3>What you can do:</h3>
          <ul style="line-height: 1.6;">
            <li>🛍️ Browse our extensive product catalog</li>
            <li>❤️ Save items to your wishlist</li>
            <li>🛒 Add items to your cart</li>
            <li>⭐ Leave reviews for products</li>
            <li>📦 Track your orders</li>
          </ul>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Happy shopping!<br>The NextBuy Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 NextBuy. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to NextBuy!

Hi ${data.name}!

Welcome to NextBuy - your destination for amazing products and great deals!

What you can do:
- Browse our extensive product catalog
- Save items to your wishlist
- Add items to your cart
- Leave reviews for products
- Track your orders

Happy shopping!
The NextBuy Team
    `;

    return {
      to: data.email,
      subject: 'Welcome to NextBuy! 🎉',
      html,
      text,
    };
  }

  private generateAdminOrderTemplate(data: OrderEmailData): EmailTemplate {
    const itemsText = data.items
      .map(
        (item) => `- ${item.name} (${item.quantity}x) 
      - $${(item.quantity * item.price).toFixed(2)}`,
      )
      .join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2e7d32; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Order Received!</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Order #${data.orderNumber}</h2>
          
          <div style="background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Order Details</h3>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</p>
          </div>
          
          <h3>Items Ordered:</h3>
          <ul>
            ${data.items.map((item) => `<li>${item.name} (${item.quantity}x) - $${(item.quantity * item.price).toFixed(2)}</li>`).join('')}
          </ul>
          
          <h3>Shipping Address:</h3>
          <p style="background: #f8f9fa; padding: 15px; border-radius: 8px;">${data.shippingAddress}</p>
          
          <p><strong>Action Required:</strong> Please process this order in the admin panel.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
New Order Received - NextBuy Admin

Order #${data.orderNumber}

Customer: ${data.customerName}
Email: ${data.customerEmail}
Total: $${data.totalAmount.toFixed(2)}

Items:
${itemsText}

Shipping Address:
${data.shippingAddress}

Action Required: Please process this order in the admin panel.
    `;

    return {
      to: '', // Will be set by the calling method
      subject: `New Order #${data.orderNumber} - NextBuy`,
      html,
      text,
    };
  }
}
