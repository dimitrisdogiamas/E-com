import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any; // Use 'any' to avoid type issues with the mock
  beforeEach(async () => {
    mockAuthService = {
      // mock the methods of AuthService
      login: jest.fn().mockResolvedValue({
        accessToken: 'mockedToken',
      }),
      register: jest
        .fn()
        .mockResolvedValue({ id: '123', email: 'test@example.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService, //provide a mock authservice
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should call login with correct parameters', async () => {
    const mockBody = { email: 'test@example.com', password: 'password123' };
    const result = await controller.login(mockBody);
    expect(mockAuthService.login).toHaveBeenCalledWith(
      mockBody.email,
      mockBody.password,
    );
    expect(result).toEqual({ accessToken: 'mockedToken' });
  });
  it('should call register with correct parameters', async () => {
    const mockRegisterDto = {
      email: 'test@example.com',
      name: ' test user',
      password: 'password123',
    };
    const result = await controller.register(mockRegisterDto);
    expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    expect(result).toEqual({
      id: '123',
      email: 'test@example.com',
    });
  });
});
