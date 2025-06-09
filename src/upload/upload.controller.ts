import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService, UploadResult } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/CustomDecorator/custom_decorator';
import { Role } from '../roles-guard/roles.enum';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile() file: any,
    @Query('folder') folder: 'products' | 'profiles' | 'general' = 'general',
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadService.uploadFile(file, folder);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: any[],
    @Query('folder') folder: 'products' | 'profiles' | 'general' = 'general',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    return this.uploadService.uploadMultipleFiles(files, folder);
  }

  @Post('product-images')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadProductImages(
    @UploadedFiles() files: any[],
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    return this.uploadService.uploadMultipleFiles(files, 'products');
  }

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfilePicture(@UploadedFile() file: any): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.uploadService.uploadFile(file, 'profiles');
  }

  @Delete('file')
  async deleteFile(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('File URL is required');
    }

    const deleted = await this.uploadService.deleteFile(url);
    return { deleted, url };
  }

  @Get('info')
  async getFileInfo(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('File URL is required');
    }

    return this.uploadService.getFileInfo(url);
  }

  @Get('config')
  async getUploadConfig() {
    return {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 10,
      allowedTypes: [
        'image / jpeg',
        'image / jpg',
        'image / png',
        'image / gif',
        'image / webp',
      ],
      folders: ['products', 'profiles', 'general'],
    };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async getUploadStats() {
    return this.uploadService.getUploadStats();
  }
}
