import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationService } from '../recommendation/recommendation.service';

@Controller('recommedation')
export class RecommedationController {
  // inject the recommendation service
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get(':userId')
  async getRecommendationsForUser(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendationsForUser(userId);
  }
}
