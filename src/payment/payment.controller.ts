import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('config')
  getStripeConfig() {
    return this.paymentService.getStripeConfig();
  }

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req: any,
  ) {
    return this.paymentService.createPaymentIntent(
      createPaymentIntentDto,
      req.user.id,
    );
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(
    @Body() confirmPaymentDto: ConfirmPaymentDto,
    @Request() req: any,
  ) {
    return this.paymentService.confirmPayment(confirmPaymentDto, req.user.id);
  }
}
