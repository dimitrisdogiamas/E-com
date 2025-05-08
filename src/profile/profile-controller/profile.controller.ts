import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Post,
  Delete,
} from '@nestjs/common';
import { ProfileService } from '../profile-service/profile.service';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateProfileDto } from '../UpdateProfileDto';
import { CreateProfileDto } from './CreateProfileDto';
@Controller('profile-controller')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    try {
      const userId = req.user.id;
      const profile = await this.profileService.getProfile(userId);
      return { success: true, data: profile };
    } catch (error) {
      throw new BadRequestException('Error fetching profile');
      console.error('Error fetching profile:', error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    try {
      const userId = req.user.id;
      const updatedProfile = await this.profileService.updateProfile(
        userId,
        updateProfileDto,
      );
      return {
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new BadRequestException('Error updating profile');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(@Req() req, @Body() createProfileDto: CreateProfileDto) {
    try {
      const userId = req.user.id;
      const newProfile = await this.profileService.createProfile(
        userId,
        createProfileDto,
      );
      return {
        success: true,
        message: 'Profile created successfully',
        data: newProfile,
      };
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new BadRequestException('Error creating profile');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async DeleteProfile(@Req() req) {
    try {
      const userId = req.user.id;
      await this.profileService.DeleteProfile(userId);
      return {
        success: true,
        message: 'Profile deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new BadRequestException('Error deleting profile');
    }
  }
}
