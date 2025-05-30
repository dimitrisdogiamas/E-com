import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // make a post request to add to wishList
  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addToWishList(@Body() body: { userId: string; productId: string }) {
    return this.wishlistService.addToWishList(body.userId, body.productId);
  }

  //remove from wishList
  @UseGuards(JwtAuthGuard)
  @Delete('remove')
  async removeFromWishList(
    @Body() body: { userId: string; productId: string },
  ) {
    return this.wishlistService.removeFromWishList(body.userId, body.productId);
  }

  // Get request to get the wishList
  @UseGuards(JwtAuthGuard)
  @Get('get')
  async getWishList(@Body() body: { userId: string }) {
    return this.wishlistService.getWishList(body.userId);
  }
}
