import { Module } from '@nestjs/common';
import { RecommedationController } from './recommedation/recommedation.controller';
import { RecommendationService } from './recommendation/recommendation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RecommedationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
