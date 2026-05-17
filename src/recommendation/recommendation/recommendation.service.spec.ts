import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
describe('RecommendationService', () => {
  let service: RecommendationService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      product: {
        findMany: jest.fn(),
      },
      orderItem: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        { provide: 'PrismaService', useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  describe('getGeneralRecommendations', () => {
    it('should return popular products ordered by reviews and date', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' }];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getGeneralRecommendations(10);

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        include: { images: true, reviews: true, variants: true },
        orderBy: [
          {
            reviews: { _count: 'desc' },
          },
          { createdAt: 'desc' },
        ],
        take: 10,
      });
    });
  });

  describe('getRecommendationForUser', () => {
    it('should return top products when user has no categories', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' }];

      // No order history
      mockPrismaService.orderItem.findMany.mockResolvedValue([]);
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getRecommendationsForUser('user1');

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        include: { images: true, reviews: true, variants: true },
        orderBy: [
          {
            reviews: { _count: 'desc' },
          },
          { createdAt: 'desc' },
        ],
        take: 8, // getGeneralRecommendations default
      });
    });

    it('should return category-based recommendations when user has order history', async () => {
      const mockOrderItems = [
        { variant: { product: { category: 'electronics' } } },
      ];
      const mockProducts = [{ id: '2', name: 'Product 2' }];

      mockPrismaService.orderItem.findMany
        .mockResolvedValueOnce(mockOrderItems)  // getUserCategories call
        .mockResolvedValueOnce([{ variantId: 'v1' }]); // getUserPurchasedProducts call
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getRecommendationsForUser('user1');

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          category: { in: ['electronics'] },
          variants: { none: { id: { in: ['v1'] } } },
        },
        include: { images: true, reviews: true, variants: true },
        orderBy: { reviews: { _count: 'desc' } },
        take: 10,
      });
    });
  });
});
