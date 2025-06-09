'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { uploadService, UploadResult } from '@/app/services/uploadService';
import { useAuth } from '@/app/components/context/AuthContext';

interface FileUploadProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  folder?: 'products' | 'profiles' | 'general';
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  folder = 'general',
  multiple = true,
  maxFiles = 5,
  accept = 'image/*',
  disabled = false,
}) => {
  const { token } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  // drag and drop the files to the upload area 
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
      const validation = uploadService.validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return null;
      }

      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
      });

      return fileWithPreview;
    }).filter(Boolean) as FileWithPreview[];

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    } else {
      setFiles(newFiles.slice(0, 1));
    }
  }, [multiple, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    multiple,
    maxFiles,
    disabled: disabled || uploading,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(file => file.id !== fileId);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (!token) {
      setError('Please login to upload files');
      return;
    }

    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let results: UploadResult[];

      if (multiple && files.length > 1) {
        results = await uploadService.uploadMultipleFiles(files, folder, token);
      } else {
        const result = await uploadService.uploadSingleFile(files[0], folder, token);
        results = [result];
      }

      setUploadedFiles(results);
      setUploadProgress(100);
      
      // Clean up file previews
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      setFiles([]);
      onUploadComplete?.(results);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: disabled || uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: disabled || uploading ? 'grey.300' : 'primary.main',
            bgcolor: disabled || uploading ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or click to select files
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {accept.includes('image') ? 'Images only' : 'Files'} • Max {maxFiles} files • 5MB each
        </Typography>
      </Paper>

      {/* File Preview */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({files.length}/{maxFiles})
          </Typography>
          <Grid container spacing={1}>
            {files.map((file) => (
              <Grid item xs={12} sm={6} md={4} key={file.id}>
                <Paper sx={{ p: 2, position: 'relative' }}>
                  {file.preview && (
                    <Box
                      component="img"
                      src={file.preview}
                      alt={file.name}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    />
                  )}
                  <Typography variant="caption" display="block" noWrap>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeFile(file.id)}
                    sx={{ position: 'absolute', top: 4, right: 4 }}
                    disabled={uploading}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || disabled}
            startIcon={uploading ? undefined : <UploadIcon />}
            fullWidth
            size="large"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </Button>
        </Box>
      )}

      {/* Progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant={uploadProgress > 0 ? "determinate" : "indeterminate"} 
            value={uploadProgress}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {uploadProgress > 0 ? `${uploadProgress}% complete` : 'Uploading...'}
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success Display */}
      {uploadedFiles.length > 0 && (
        <Alert 
          severity="success" 
          sx={{ mt: 2 }}
          icon={<CheckIcon />}
        >
          Successfully uploaded {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}!
          <Box sx={{ mt: 1 }}>
            {uploadedFiles.map((file, index) => (
              <Chip
                key={index}
                label={file.filename}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload; 