import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../product-service/product.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let mockProductService: Partial<ProductService>;

  beforeEach(async () => {
    //we mock all the methods of the product service
    mockProductService = {
      createProduct: jest.fn(),
      getAllProducts: jest.fn(),
      getProductById: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  //test for getting all products
  it('should call getProducts and return the result', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        category: 'Category 1',
      },
    ];
    (mockProductService.getAllProducts as jest.Mock).mockResolvedValue(
      mockProducts,
    );

    const result = await controller.getAllProducts();
    // the mockProductService should be called with no parameters because the method getAllProducts does not take any parameters
    expect(mockProductService.getAllProducts).toHaveBeenCalledWith();

    expect(result).toEqual(mockProducts);
  });

  //test for getting a product by id
  it('should call getProductById and return the result', async () => {
    const mockProduct = {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
      category: 'Category 1',
    };

    //we mock the product method for the get product by id
    (mockProductService.getProductById as jest.Mock).mockResolvedValue(
      mockProduct,
    );

    //save the result
    const result = await controller.getProductById('1');

    // then we check if the mockProductService was called with the id
    expect(mockProductService.getProductById).toHaveBeenCalledWith('1');

    //and we check the result if it is equal to the mockProduct
    expect(result).toEqual(mockProduct);
  });

  //test for if no product was found for the id
  it('should return NotFoundException if no product was found', async () => {
    // we need to mock the service and then reject to throw
    (mockProductService.getProductById as jest.Mock).mockRejectedValue(
      new NotFoundException('Product not found'),
    );

    // and  then we will expect it to throw an error because the product was not found or it doesn't exist
    await expect(controller.getProductById('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  //test for creating a product

  it('should call createProduct and return the result', async () => {
    const mockBody = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: 'Test Category',
    };
    const mockCreatedProduct = {
      id: '1',
      ...mockBody,
    };

    // we need to mock the product service to create a product
    (mockProductService.createProduct as jest.Mock).mockResolvedValue(
      mockCreatedProduct,
    );

    // we save the result of the controller to create a product
    const result = await controller.createProduct(mockBody);
    // we expect the mockProductService to have been called with the body
    expect(mockProductService.createProduct).toHaveBeenCalledWith(mockBody);

    // and we expect the result to be the same as the mockCreatedProduct
    expect(result).toEqual(mockCreatedProduct);
  });

  //test for updating a product
  it('should call updateProduct and return the result', async () => {
    const mockBody = {
      name: 'Updated Body',
      description: 'Updated Description',
      price: 150,
      category: 'Updated Category',
    };

    const mockUpdatedProduct = {
      id: '1',
      ...mockBody,
    };
    // we mock the updated product
    (mockProductService.updateProduct as jest.Mock).mockResolvedValue(
      mockUpdatedProduct,
    );

    // result will await the controller to update the product for the id of 1 and the rest of the body will be the mockBody
    const result = await controller.updateProduct('1', mockBody);

    // expectations
    expect(mockProductService.updateProduct).toHaveBeenCalledWith(
      '1',
      mockBody,
    );

    //and the result to be equal to the mockUpdatedProduct
    expect(result).toEqual(mockUpdatedProduct);
  });

  //test for deleting a product
  it('should call deleteProduct and return the result', async () => {
    (mockProductService.deleteProduct as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Product deleted successfully',
    });

    // this saves in the result the awaited value of the controller to delete the product with id 1
    const result = await controller.deleteProduct('1');
    // then we expect the mockProductService to have been called with the id of 1
    expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');

    // and then the result to be equal to the success message
    expect(result).toEqual({
      success: true,
      message: 'Product deleted successfully',
    });
  });

  //test for deleting a product that does not exist
  it('should return NotFoundException if product to delete does not exist', async () => {
    // we mock the product service to delete the product which does not exist
    (mockProductService.deleteProduct as jest.Mock).mockRejectedValue(
      new NotFoundException('Product not found'),
    );
    await expect(controller.deleteProduct('1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
