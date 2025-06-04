import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // Add to wishlist
  @UseGuards(JwtAuthGuard)
  @Post()
  async addToWishList(
    @Request() req: any,
    @Body() body: { productId: string },
  ) {
    const userId = req.user.id;
    return this.wishlistService.addToWishList(userId, body.productId);
  }

  // Remove from wishlist
  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async removeFromWishList(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    const userId = req.user.id;
    return this.wishlistService.removeFromWishList(userId, productId);
  }

  // Get user's wishlist
  @UseGuards(JwtAuthGuard)
  @Get()
  async getWishList(@Request() req: any) {
    const userId = req.user.id;
    return this.wishlistService.getWishList(userId);
  }
}
