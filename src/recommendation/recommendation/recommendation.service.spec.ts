import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { PrismaService } from '../../prisma/prisma.service';
describe('RecommendationService', () => {
  let service: RecommendationService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
    },
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecommendationForUser', () => {
    it('should return top porducts when user has no categories', async () => {
      //mock getUserCategories to return empty array
      jest.spyOn(service as any, 'getUserCategories').mockResolvedValue([]);

      // mock prisma product findMany to return mock products
      const mockProducts = [{ id: 1, name: 'Product 1 ' }];
      // οπότε το mockPrismaService θα επιστρέφει το mockProducts
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      // call the service
      const result = await service.getRecommendationsForUser('user1');

      // assert the result
      expect(result).toEqual(mockProducts);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          category: 'all',
        },
        include: {
          images: true,
          reviews: true,
          variants: true,
        },
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
      });
    });
    it('should return recommendations based on user categories', async () => {
      // mock getUserCategories to return mock categories
      const mockCategories = ['category1', 'category2'];
      const mockPurchasedProducts = [{ variantId: 1 }];
      const mockRecommendations = [{ id: 1, name: 'Product 1' }];

      jest
        .spyOn(service as any, 'getUserCategories')
        .mockResolvedValue(mockCategories);

      jest
        .spyOn(service as any, 'getUserPurchasedProducts')
        .mockResolvedValue(mockPurchasedProducts);

      mockPrismaService.product.findMany.mockResolvedValue(mockRecommendations);

      const result = await service.getRecommendationsForUser('user1');

      expect(result).toEqual(mockRecommendations);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          category: {
            in: mockCategories,
          },
          variants: {
            none: {
              id: {
                in: [1], // αλλάξαμε το 1 σε [1]
              },
            },
          },
        },
        include: {
          images: true,
          reviews: true,
          variants: true,
        },
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
        take: 10, // και προσθέσαμε το take ώστε να παίρνει 10 προϊόντα
      });
    });
  });
});
