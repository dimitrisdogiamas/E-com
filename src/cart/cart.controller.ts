import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('cart')
// @UseGuards(JwtAuthGuard)  // Moved to individual methods
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Request() req: any) {
    console.log('getCart controller called');
    console.log('Request user:', req.user);
    const userId = req.user.id;
    console.log('Extracted userId:', userId);
    return this.cartService.getCart(userId);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addToCart(
    @Request() req: any,
    @Body() body: { variantId: string; quantity: number }
  ) {
    console.log('User from token:', req.user);
    const userId = req.user.id;
    console.log('Extracted userId:', userId);
    return this.cartService.addToCart(userId, body.variantId, body.quantity);
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateCartItem(
    @Request() req: any,
    @Body() body: { variantId: string; quantity: number }
  ) {
    const userId = req.user.id;
    return this.cartService.updateCartItem(userId, body.variantId, body.quantity);
  }

  @Delete('remove/:variantId')
  @UseGuards(JwtAuthGuard)
  async removeFromCart(
    @Request() req: any,
    @Param('variantId') variantId: string
  ) {
    const userId = req.user.id;
    return this.cartService.removeFromCart(userId, variantId);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Request() req: any) {
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
  }

  @Get('test')
  // No JWT guard for testing
  async getCartTest() {
    console.log('getCartTest called without auth');
    // Use a hardcoded userId for testing
    const userId = '60de91e8-035b-424a-abd5-68af393218ac';
    return this.cartService.getCart(userId);
  }
} 