import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
jest.mock('bcryptjs'); // Mock bcryptjs to avoid conflict
describe('AuthService', () => {
  let service: AuthService;
  let mockJwtService: Partial<JwtService>;
  let mockUserService: Partial<UserService>;
  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mockedToken'),
    };
    mockUserService = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService, //provide a mock user service
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call UserService to find user by email', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
    };
    (mockUserService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.login('test@example.com', 'password');
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
    expect(result).toEqual({ accessToken: 'mockedToken' });
  });
  it('should throw NotFoundException if user not found', async () => {
    (mockUserService.findUserByEmail as jest.Mock).mockResolvedValue(null);
    await expect(service.login('test@example.com', 'password')).rejects.toThrow(
      'User not found',
    );
  });
  it('should throw UnauthorizedException if user not found', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
    };
    (mockUserService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
  });
});
