import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from '../profile-service/profile.service';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: Partial<ProfileService>;
  beforeEach(async () => {
    profileService = {
      updateProfile: jest
        .fn()
        .mockResolvedValue({ message: 'profile updated successfully' }),
      getProfile: jest.fn().mockResolvedValue({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      }),
      createProfile: jest.fn(), //Mock createProfile
      DeleteProfile: jest.fn(), //mock DeleteProfile
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        ProfileService,
        {
          provide: ProfileService,
          useValue: profileService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should call getProfile with the correct user ID', async () => {
    const mockRequest = { user: { id: '123' } };
    const mockProfile = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    };
    (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
    const result = await controller.getProfile(mockRequest);
    expect(result).toEqual({
      success: true,
      data: mockProfile,
    });
    expect(profileService.getProfile).toHaveBeenCalledWith('123');
  });
  it('should call updateProfile with the correct user Id and Data', async () => {
    const mockRequest = { user: { id: '123' } };
    const mockUpdateProfileDto = { name: 'Updated User' };
    const mockUpdatedProfile = {
      id: '123',
      name: 'Updated User',
      email: 'test@example.com',
    };
    (profileService.updateProfile as jest.Mock).mockResolvedValue(
      mockUpdatedProfile,
    );
    const result = await controller.updateProfile(
      mockRequest,
      mockUpdateProfileDto,
    );
    expect(result).toEqual({
      success: true,
      message: 'Profile updated successfully', //Capitalization
      data: mockUpdatedProfile,
    });
    expect(profileService.updateProfile).toHaveBeenCalledWith(
      '123',
      mockUpdateProfileDto,
    );
  });
  it('should call createProfile with the correct user Id an Data', async () => {
    const mockRequest = { user: { id: '123' } };
    const mockCreateProfileDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'newpassword',
    };
    const mockNewProfile = {
      id: '123',
      name: 'New User',
      email: 'newuser@example.com',
    };
    (profileService.createProfile as jest.Mock).mockResolvedValue(
      mockNewProfile,
    );
    const result = await controller.createProfile(
      mockRequest,
      mockCreateProfileDto,
    );
    // we expect the create profile to be called with the id and the createProfileDto
    expect(profileService.createProfile).toHaveBeenCalledWith(
      '123',
      mockCreateProfileDto,
    );
    expect(result).toEqual({
      success: true,
      message: 'Profile created successfully',
      data: mockNewProfile,
    });
  });
  it('should delete the profile if it exists', async () => {
    const mockRequest = { user: { id: '123' } };
    (profileService.DeleteProfile as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.DeleteProfile(mockRequest);
    expect(profileService.DeleteProfile).toHaveBeenCalledWith('123');
    expect(result).toEqual({
      success: true,
      message: 'Profile deleted successfully',
    });
  });
});
