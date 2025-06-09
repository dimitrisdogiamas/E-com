'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import FileUpload from '@/app/components/upload/FileUpload';
import { uploadService, UploadResult } from '@/app/services/uploadService';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  Inventory as ProductIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;// defines the children of the tab panel but optional
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      aria-labelledby={`upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UploadPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [uploadStats, setUploadStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);


  // fetching the user from the server and redirecting if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadComplete = (results: UploadResult[]) => {
    setUploadedFiles(prev => [...prev, ...results]);
    loadUploadStats(); // Refresh stats
  };

  // if the upload fails 
  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const loadUploadStats = async () => {
    if (!token || user?.role !== 'ADMIN') return;
    
    // the user is the admin so he can see the upload stats
    setLoadingStats(true);
    try {
      const stats = await uploadService.getUploadStats(token);
      setUploadStats(stats);
    } catch (error) {
      console.error('Failed to load upload stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  //  fetch the user role to check the upload stats
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadUploadStats();
    }
  }, [user, token]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          Please login to access file upload.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        File Upload Center
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload images and files for products, profiles, or general use.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="upload tabs">
          <Tab icon={<ImageIcon />} label="General Upload" />
          <Tab icon={<ProductIcon />} label="Product Images" />
          <Tab icon={<PersonIcon />} label="Profile Picture" />
          {user?.role === 'ADMIN' && (
            <Tab icon={<StatsIcon />} label="Upload Stats" />
          )}
        </Tabs>
      </Box>

      {/* General Upload */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  General File Upload
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload general files and images. Maximum 5 files, 5MB each.
                </Typography>
                <FileUpload
                  folder="general"
                  multiple={true}
                  maxFiles={5}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Guidelines
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Supported formats"
                      secondary="JPEG, PNG, GIF, WebP"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="File size limit"
                      secondary="5MB per file"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Maximum files"
                      secondary="5 files per upload"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Product Images Upload */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Product Images Upload
              {user?.role !== 'ADMIN' && (
                <Chip label="Admin Only" color="warning" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload product images for the e-commerce catalog. Admin access required.
            </Typography>
            
            {user?.role === 'ADMIN' ? (
              <FileUpload
                folder="products"
                multiple={true}
                maxFiles={5}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            ) : (
              <Alert severity="warning">
                You need admin privileges to upload product images.
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Profile Picture Upload */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Picture Upload
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your profile picture. Only one image allowed.
            </Typography>
            <FileUpload
              folder="profiles"
              multiple={false}
              maxFiles={1}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Upload Stats (Admin only) */}
      {user?.role === 'ADMIN' && (
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Upload Statistics
                </Typography>
                <Button
                  variant="outlined"
                  onClick={loadUploadStats}
                  disabled={loadingStats}
                  startIcon={loadingStats ? <CircularProgress size={16} /> : <StatsIcon />}
                >
                  Refresh
                </Button>
              </Box>
              
              {uploadStats ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Overall Statistics
                      </Typography>
                      <Typography variant="body2">
                        Total Files: <strong>{uploadStats.totalFiles}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Total Size: <strong>{formatFileSize(uploadStats.totalSize)}</strong>
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        By Folder
                      </Typography>
                      {/*  the folder stats are the stats for each folder */}
                      {Object.entries(uploadStats.folderStats).map(([folder, stats]: [string, any]) => (
                        <Box key={folder} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>{folder}:</strong> {stats.files} files ({formatFileSize(stats.size)})
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  Click refresh to load upload statistics.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      )}

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recently Uploaded Files
            </Typography>
            <Grid container spacing={2}>
              {uploadedFiles.slice(-6).map((file, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <img
                      src={file.url}
                      alt={file.filename}
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <Typography variant="caption" display="block" noWrap>
                      {file.filename}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)} • {file.mimetype}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
} 