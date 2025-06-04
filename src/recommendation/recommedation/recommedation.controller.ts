import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RecommendationService } from '../recommendation/recommendation.service';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';

@Controller('recommedation')
export class RecommedationController {
  // inject the recommendation service
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('general')
  async getGeneralRecommendations(@Query('limit') limit: string = '8') {
    return this.recommendationService.getGeneralRecommendations(parseInt(limit));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getRecommendationsForUser(
    @Request() req: any,
    @Query('limit') limit: string = '10'
  ) {
    const userId = req.user.sub;
    return this.recommendationService.getRecommendationsForUser(userId, parseInt(limit));
  }

  @Get(':userId')
  async getRecommendationsForSpecificUser(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendationsForUser(userId);
  }
}
