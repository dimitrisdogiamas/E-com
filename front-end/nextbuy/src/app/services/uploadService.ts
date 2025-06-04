import { apiClient } from './apiClient';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface UploadStats {
  totalFiles: number;
  totalSize: number;
  folderStats: Record<string, { files: number; size: number }>;
}

class UploadService {
  /**
   * Upload a single file
   */
  async uploadSingleFile(
    file: File,
    folder: 'products' | 'profiles' | 'general' = 'general',
    token: string
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/upload/single?folder=${folder}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    folder: 'products' | 'profiles' | 'general' = 'general',
    token: string
  ): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post(
      `/upload/multiple?folder=${folder}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload product images (Admin only)
   */
  async uploadProductImages(files: File[], token: string): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post('/upload/product-images', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File, token: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload/profile-picture', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Delete a file
   */
  async deleteFile(url: string, token: string): Promise<{ deleted: boolean; url: string }> {
    const response = await apiClient.delete('/upload/file', {
      headers: { Authorization: `Bearer ${token}` },
      data: { url },
    });

    return response.data;
  }

  /**
   * Get file information
   */
  async getFileInfo(
    url: string,
    token: string
  ): Promise<{ exists: boolean; size?: number; mimetype?: string }> {
    const response = await apiClient.get(`/upload/info?url=${encodeURIComponent(url)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  }

  /**
   * Get upload statistics (Admin only)
   */
  async getUploadStats(token: string): Promise<UploadStats> {
    const response = await apiClient.get('/upload/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  }

  /**
   * Helper function to validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' };
    }

    return { valid: true };
  }

  /**
   * Helper function to format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Helper function to get file extension
   */
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }
}

export const uploadService = new UploadService(); 