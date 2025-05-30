import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const mockUserService = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
    };
    const mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true), //Always allow access
    };
    const mockRolesGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService, //provide a mock user service
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: RolesGuard,
          useValue: mockRolesGuard,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Override the JwtAuthGuard with the mock
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard) // Override the RolesGuard with the mock
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
