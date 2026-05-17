import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      try {
        this.stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-08-27.basil',
        });
      } catch (error) {
        console.warn('Failed to initialize Stripe:', error.message);
      }
    } else {
      console.warn(
        'STRIPE_SECRET_KEY not configured - Stripe features will be disabled',
      );
    }
  }

  private ensureStripeInitialized() {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
  }

  async getStripeConfig() {
    const publishableKey = this.configService.get<string>(
      'STRIPE_PUBLISHABLE_KEY',
    );
    if (!publishableKey) {
      throw new BadRequestException('Stripe configuration not found');
    }
    return {
      publishableKey,
    };
  }

  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
    userId: string,
  ) {
    this.ensureStripeInitialized();
    try {
      const { amount, currency = 'usd' } = createPaymentIntentDto;

      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      // Create payment intent with Stripe
      const paymentIntent = await this.stripe!.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId,
        },
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create payment intent: ${error.message}`,
      );
    }
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto, userId: string) {
    this.ensureStripeInitialized();
    try {
      const { paymentIntentId } = confirmPaymentDto;

      // Retrieve payment intent from Stripe
      const paymentIntent =
        await this.stripe!.paymentIntents.retrieve(paymentIntentId);

      // Validate that this payment intent belongs to the user
      if (paymentIntent.metadata.userId !== userId) {
        throw new BadRequestException('Payment intent does not belong to user');
      }

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to confirm payment: ${error.message}`,
      );
    }
  }
}
