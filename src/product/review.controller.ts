import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ReviewService } from '../product/review.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('product/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reviewService.getProductReviews(
      productId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Request() req: any,
    @Body() body: { productId: string; rating: number; comment: string },
  ) {
    const userId = req.user.id;
    return this.reviewService.createReview(
      userId,
      body.productId,
      body.rating,
      body.comment,
    );
  }

  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Request() req: any,
    @Param('reviewId') reviewId: string,
    @Body() body: { rating?: number; comment?: string },
  ) {
    const userId = req.user.id;
    return this.reviewService.updateReview(
      reviewId,
      userId,
      body.rating,
      body.comment,
    );
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Request() req: any, @Param('reviewId') reviewId: string) {
    const userId = req.user.id;
    return this.reviewService.deleteReview(reviewId, userId);
  }

  @Get('user/my')
  @UseGuards(JwtAuthGuard)
  async getUserReviews(@Request() req: any) {
    const userId = req.user.id;
    return this.reviewService.getUserReviews(userId);
  }
}
