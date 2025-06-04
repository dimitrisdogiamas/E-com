import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  async uploadFile(
    file: any, // Using any to avoid Express.Multer.File type issues
    folder: 'products' | 'profiles' | 'general' = 'general',
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const filename = this.generateUniqueFilename(file.originalname);
    const folderPath = path.join(this.uploadDir, folder);
    const filePath = path.join(folderPath, filename);

    try {
      // Ensure folder exists
      await this.ensureFolderExists(folderPath);

      // Save file
      await writeFile(filePath, file.buffer);

      // Generate URL
      const baseUrl =
        this.configService.get<string>('BASE_URL') || 'http://localhost:4001';
      const url = `${baseUrl}/uploads/${folder}/${filename}`;

      this.logger.log(`📁 File uploaded: ${filename} (${file.size} bytes)`);

      return {
        url,
        filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error('File upload failed:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadMultipleFiles(
    files: any[], // Using any[] to avoid type issues
    folder: 'products' | 'profiles' | 'general' = 'general',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed');
    }

    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(url: string): Promise<boolean> {
    try {
      // Extract filename and folder from URL
      const urlParts = url.split('/uploads/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid file URL');
      }

      const filePath = path.join(this.uploadDir, urlParts[1]);

      // Check if file exists
      await access(filePath);

      // Delete file
      await unlink(filePath);

      this.logger.log(`🗑️ File deleted: ${urlParts[1]}`);
      return true;
    } catch (error) {
      this.logger.error('File deletion failed:', error);
      return false;
    }
  }

  async getFileInfo(
    url: string,
  ): Promise<{ exists: boolean; size?: number; mimetype?: string }> {
    try {
      const urlParts = url.split('/uploads/');
      if (urlParts.length !== 2) {
        return { exists: false };
      }

      const filePath = path.join(this.uploadDir, urlParts[1]);
      const stats = await fs.promises.stat(filePath);

      return {
        exists: true,
        size: stats.size,
        mimetype: this.getMimeTypeFromExtension(path.extname(filePath)),
      };
    } catch {
      return { exists: false };
    }
  }

  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);

    return `${baseName}_${timestamp}_${random}${extension}`;
  }

  private async ensureUploadDirExists(): Promise<void> {
    try {
      await access(this.uploadDir);
    } catch {
      await mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`📁 Created upload directory: ${this.uploadDir}`);
    }
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    try {
      await access(folderPath);
    } catch {
      await mkdir(folderPath, { recursive: true });
      this.logger.log(`📁 Created folder: ${folderPath}`);
    }
  }

  private getMimeTypeFromExtension(ext: string): string {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }

  // Utility method to create folders and get stats
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    folderStats: Record<string, { files: number; size: number }>;
  }> {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      folderStats: {} as Record<string, { files: number; size: number }>,
    };

    try {
      const folders = ['products', 'profiles', 'general'];

      for (const folder of folders) {
        const folderPath = path.join(this.uploadDir, folder);
        stats.folderStats[folder] = { files: 0, size: 0 };

        try {
          const files = await fs.promises.readdir(folderPath);
          for (const file of files) {
            const filePath = path.join(folderPath, file);
            const fileStats = await fs.promises.stat(filePath);
            if (fileStats.isFile()) {
              stats.folderStats[folder].files++;
              stats.folderStats[folder].size += fileStats.size;
              stats.totalFiles++;
              stats.totalSize += fileStats.size;
            }
          }
        } catch {
          // Folder doesn't exist, skip
        }
      }
    } catch (error) {
      this.logger.error('Failed to get upload stats:', error);
    }

    return stats;
  }
}
