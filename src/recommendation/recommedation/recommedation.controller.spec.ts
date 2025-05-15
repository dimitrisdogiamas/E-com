import { Test, TestingModule } from '@nestjs/testing';
import { RecommedationController } from './recommedation.controller';
import { RecommendationService } from '../recommendation/recommendation.service';
import { PrismaService } from '../../prisma/prisma.service';
describe('RecommedationController', () => {
  let controller: RecommedationController;
  let service: RecommendationService;

  const mockRecommendationService = {
    getRecommendationsForUser: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommedationController],
      providers: [
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
        PrismaService,
      ],
    }).compile();

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

      const result = await controller.getRecommendationsForUser('user1');

      expect(result).toEqual(mockRecommendations);
      expect(service.getRecommendationsForUser).toHaveBeenCalledWith('user1');
    });
  });
});
