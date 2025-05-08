import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
describe('ProfileService', () => {
  let service: ProfileService;
  let mockPrismaService: Partial<PrismaService>;
  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        createProfile: jest.fn(),
        DeleteProfile: jest.fn(),
        delete: jest.fn(),
      } as any, //κάνουμε χρήση του any για να παρακαμψούμε το σφάλμα τύπου
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, //provide a mock prisma service
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call PrismaService to get a profile', async () => {
    const mockUserId = '123';
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
    };
    // mock the findUnique method of PrismaService
    (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(
      mockUser,
    );
    // we wait for the result of the getProfile method to be equal to the mockedUser
    const result = await service.getProfile(mockUserId);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    expect(result).toEqual(mockUser); // check if the result is equal to the mockedUser
  });

  it('should call PrismaService to update a profile', async () => {
    const mockUserId = '123';
    const mockUpdateProfileDto = {
      name: 'Updated User',
      password: 'newpassword123',
    };
    const mockUpdatedUser = {
      id: '123',
      name: 'Updated User',
      email: 'test@example.com',
    };
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('mockSalt');
    //Mock the genSalt method of bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword'); // Mock bcrypt hash
    (mockPrismaService.user.update as jest.Mock).mockResolvedValue(
      mockUpdatedUser,
    );
    const result = await service.updateProfile(
      mockUserId,
      mockUpdateProfileDto,
    );
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 'mockSalt'); // check if the password is hashed and if it is number
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: mockUserId },
      data: {
        name: 'Updated User',
        password: 'hashedPassword', // check if the password is a string
      },
    });
    expect(result).toEqual(mockUpdatedUser); // check if the result is equal to the mockedUpdatedUser
  });
  it('should create a new profile with correct data', async () => {
    const mockUserId = '123';
    const mockCreateProfileDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'newpassword123',
    };
    // we mock the prisma service to return null for findUnique for the user
    (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    // we need to mock as well the password to not get confilicts
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

    // we mock the create method of PrismaService
    (mockPrismaService.user.create as jest.Mock).mockResolvedValue({
      id: '123',
      name: 'New User',
      email: 'newuser@example.com',
      password: 'hashedPassword',
    });

    const result = await service.createProfile(
      mockUserId,
      mockCreateProfileDto,
    );

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@example.com' },
    });
    //Ensure bcrypt hash is called to hash the password
    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);

    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'New User',
        email: 'newuser@example.com',
        password: expect.any(String), // check if the password is a string
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: '123',
        name: 'New User',
        email: 'newuser@example.com',
      }),
    );
  });
  it('should throw an error if the email already exists', async () => {
    //Mock the PrismaService.findUnique to return an existing user
    (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'newuser@example.com',
    });

    // Expect the method to throw an error
    await expect(
      service.createProfile('123', {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'newpassword123',
      }),
    ).rejects.toThrow('Email already exists');

    // we need to check the existing email with the findUnique
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@example.com' },
    });
    // We need to ensure the prismaService.create is not called
    expect(mockPrismaService.user.create).not.toHaveBeenCalled();
  });

  it('should delete a profile if it exists', async () => {
    const mockUserId = '123';

    // We need to mock the findUnique method to return a user
    (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    });

    //We mock the prisma service to resolve successfully
    (mockPrismaService.user.delete as jest.Mock).mockResolvedValue(undefined);

    const result = await service.DeleteProfile(mockUserId);

    // We expect the user to have been called with the mockUserId
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
    });

    // Ensure the result is undefined (as the delete method does not return anything)
    expect(result).toBeUndefined();
  });
  it('should throw an error if the profile does not exist', async () => {
    const mockUserId = '123';

    // we mock the findUnique to throw a new error
    (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    // we expect the method to throw an error
    await expect(service.DeleteProfile(mockUserId)).rejects.toThrow(
      'Profile not found',
    );

    //Ensure PrismaService.delete is not called
    expect(mockPrismaService.user.delete).not.toHaveBeenCalledWith();
  });
});
