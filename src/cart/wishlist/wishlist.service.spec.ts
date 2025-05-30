import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from 'src/prisma/prisma.service';
describe('WishlistService', () => {
  let service: WishlistService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: {
            wishListItem: {
              create: jest.fn(),
              deleteMany: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    prisma = module.get<PrismaService>(PrismaService); // get the prisma service
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a product to the wishList ', async () => {
    const mockItem = { id: '1', userId: 'user1', productId: 'prod1' };
    (prisma.wishListItem.create as jest.Mock).mockResolvedValue(mockItem);
    const result = await service.addToWishList('user1', 'prod1');

    expect(prisma.wishListItem.create).toHaveBeenCalledWith({
      data: { userId: 'user1', productId: 'prod1' },
    });

    expect(result).toEqual(mockItem);
  });

  it('should remove a product from the wishList', async () => {
    const mockResult = { count: 1 };
    (prisma.wishListItem.deleteMany as jest.Mock).mockResolvedValue(mockResult);

    const result = await service.removeFromWishList('user1', 'prod1');

    expect(prisma.wishListItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user1', productId: 'prod1' },
    });
    expect(result).toEqual(mockResult);
  });

  it('should get the wishList from the user', async () => {
    const mockItems = [{ id: '1', userId: 'user1', productId: 'prod1' }];
    (prisma.wishListItem.findMany as jest.Mock).mockResolvedValue(mockItems);

    const result = await service.getWishList('user1');
    expect(prisma.wishListItem.findMany).toHaveBeenCalledWith({
      where: { userId: 'user1' },
      include: { product: true },
    });
    expect(result).toEqual(mockItems);
  });
});
