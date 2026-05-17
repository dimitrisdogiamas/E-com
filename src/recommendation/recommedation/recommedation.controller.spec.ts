import { Test, TestingModule } from '@nestjs/testing';
import { RecommedationController } from './recommedation.controller';
import { RecommendationService } from '../recommendation/recommendation.service';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';

describe('RecommedationController', () => {
  let controller: RecommedationController;
  let service: RecommendationService;

  const mockRecommendationService = {
    getRecommendationsForUser: jest.fn(),
    getGeneralRecommendations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommedationController],
      providers: [
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<RecommedationController>(RecommedationController);
    service = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecommendationsForUser', () => {
    it('should return recommendations for a user', async () => {
      const mockRecommendations = [{ id: 1, name: 'Product 1' }];

      mockRecommendationService.getRecommendationsForUser.mockResolvedValue(
        mockRecommendations,
      );

      const result = await controller.getRecommendationsForUser({
        user: { sub: 'user1' },
      } as any);

      expect(result).toEqual(mockRecommendations);
      expect(service.getRecommendationsForUser).toHaveBeenCalledWith(
        'user1',
        10,
      );
    });
  });
});
