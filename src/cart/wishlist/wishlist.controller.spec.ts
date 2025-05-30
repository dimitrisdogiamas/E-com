import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
describe('WishlistController', () => {
  let controller: WishlistController;
  let service: WishlistService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: {
            addToWishList: jest.fn(),
            removeFromWishList: jest.fn(),
            getWishList: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add a product to the wishList', async () => {
    const mockResult = { id: '1', userId: 'user1', productId: 'prod1' };
    (service.addToWishList as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.addToWishList({
      userId: 'user1',
      productId: 'prod1',
    });
    expect(result).toEqual(mockResult);
  });

  it('should remove a product from the wishList', async () => {
    const mockResult = { count: 1 };
    (service.removeFromWishList as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.removeFromWishList({
      userId: 'user1',
      productId: 'prod1',
    });
    expect(service.removeFromWishList).toHaveBeenCalledWith('user1', 'prod1');

    expect(result).toEqual(mockResult);
  });

  it('should get the wishList from the user', async () => {
    const mockItem = [{ id: '1', userId: 'user1', productId: 'prod1' }];
    (service.getWishList as jest.Mock).mockResolvedValue(mockItem);
    const result = await controller.getWishList({ userId: 'user1' });

    expect(service.getWishList).toHaveBeenCalledWith('user1');

    expect(result).toEqual(mockItem);
  });
});
