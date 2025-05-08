import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
describe('ProductService', () => {
  let service: ProductService;
  let mockPrismaService: Partial<PrismaService>;

  beforeEach(async () => {
    // we need to mock the values and the methods of Prisma Service
    mockPrismaService = {
      product: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        fields: {
          id: {},
          name: {},
          description: {},
          price: {},
          category: {},
        } as Prisma.ProductFieldRefs,
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //test for creating a product
  it('should create a product', async () => {
    const mockProduct = {
      id: '1',
      name: 'Test product',
      description: 'Test Description',
      price: 100,
      category: 'Test Category',
    };
    (mockPrismaService.product.create as jest.Mock).mockResolvedValue(
      mockProduct,
    );

    //the result of this will be
    const result = await service.createProduct({
      name: 'Test product',
      description: 'Test Description',
      price: 100,
      category: 'Test Category',
    });
    //but also we need to mock and expect the mockPrismaService to be called from the mock object
    expect(mockPrismaService.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Test product',
        description: 'Test Description',
        price: 100,
        category: 'Test Category',
      }),
    });
    // we will expect the result to be equal with the mockObject we created
    expect(result).toEqual(mockProduct);
  });

  //the test for getting all products
  it('should return all products', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        category: 'Category 1',
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 200,
        category: 'Category 2',
      },
    ];
    (mockPrismaService.product.findMany as jest.Mock).mockResolvedValue(
      mockProducts,
    );

    // the result
    const result = await service.getAllProducts();

    // expect the service to have been called
    expect(mockPrismaService.product.findMany).toHaveBeenCalled();

    //expect the result to be equal
    expect(result).toEqual(mockProducts);
  });

  it('should return a product by a id', async () => {
    const mockProduct = {
      id: '1',
      name: 'Test product',
      description: 'Test Description',
      price: 100,
      category: 'Test Category',
    };

    //we mock the service
    (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(
      mockProduct,
    );

    //the result
    const result = await service.getProductById('1');

    //we expect the mockService to have been called
    expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });

    //then we expect the result
    expect(result).toEqual(mockProduct);
  });

  it('should throw an error if product not found', async () => {
    (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

    // we expect the serive to find the product with the id of 1 but it gets rejected and throws a not found exception
    await expect(service.getProductById('1')).rejects.toThrow(
      new NotFoundException('Product with the id 1 not found'),
    );
  });
  it('should update a product', async () => {
    const mockExistingProduct = {
      id: '1',
      name: 'Existing Product',
      description: 'Existing Description',
      price: 100,
      category: 'Existing Category',
    };
    // we mock the method for the existing product
    (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(
      mockExistingProduct,
    );
    const mockUpdatedProduct = {
      id: '1',
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
      category: 'Updated Category',
    };

    // we mock the service
    (mockPrismaService.product.update as jest.Mock).mockResolvedValue(
      mockUpdatedProduct,
    );

    // we need the result
    const result = await service.updateProduct('1', {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
      category: 'Updated Category',
    });

    // we expect the mockService to have been called with the mockUpdatedProduct but first with the id of 1
    expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });

    // then we expect the mockPrismaService product for the update
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        category: 'Updated Category',
      },
    });
    // at the end we expect the result
    expect(result).toEqual(mockUpdatedProduct);
  });
  it('should throw an error if product to update does not exist', async () => {
    (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

    // we expect the service to throw an error
    await expect(
      service.updateProduct('1', { name: 'Updated Product' }),
    ).rejects.toThrow(NotFoundException);

    //expect the mockPrisma Service
    expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(mockPrismaService.product.update).not.toHaveBeenCalledWith();
  });
  it('should delete a product', async () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      price: 150,
      category: 'Test Category',
    };
    // we mock the find Unique method and the resolved value is the mocked object we created
    (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(
      mockProduct,
    );
    // we mock the delete method
    (mockPrismaService.product.delete as jest.Mock).mockResolvedValue(
      undefined,
    );
    const result = await service.deleteProduct('1');

    // we expect the mockPrismaService to have been called with the id of 1
    expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });

    expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });

    expect(result).toEqual({
      success: true,
      message: 'Product with id 1 deleted successfully',
    });
  });

  it('should throw NotFoundException if product to delete does not exist', async () => {
    (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.deleteProduct('1')).rejects.toThrow(NotFoundException);

    //
    expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(mockPrismaService.product.delete).not.toHaveBeenCalled();
  });
});
