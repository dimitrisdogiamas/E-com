'use client'
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { getProfile, updateProfile, Profile, UpdateProfileData } from '@/app/services/profileService';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';


export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [editData, setEditData] = useState<UpdateProfileData>({
    name: '',
    password: '',
  });

  const [updateLoading, setUpdateLoading] = useState(false);

  // we need to fetch the data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const profileData = await getProfile(token);
        setProfile(profileData);
        setEditData({ name: profileData.name, password: '' });
      } catch (error) {
        setError('Failed to load profile');
        console.error('Profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    // if the user exists and he logs in succcessfully, we load the profile
    if (user && token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user, token, router]);
  

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  }

  const handleCancel= () => {
    setIsEditing(false);
    if (profile) {
      setEditData({ name: profile.name, password: '' });
    }
    setError('');
  }
  // this function handles the change in the input fields 
  const handleSave = async () => {
    setUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!token) return;


      // Only send fields that have changed 

      const updatePayload: UpdateProfileData = {};
      if (editData.name !== profile?.name) {
        updatePayload.name = editData.name;
      }
      if (editData.password) {
        updatePayload.password = editData.password;
      }

      if (Object.keys(updatePayload).length === 0) {
        setError('No changes to save');
        setUpdateLoading(false);
        return;
      }

      const updatedProfile = await updateProfile(token, updatePayload);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setEditData({ name: updatedProfile.name, password: '' }); // clear password field
    } catch (error) {
      setError('Failed to update profile');
      console.error('Update profile error: ', error);
    } finally {
      setUpdateLoading(false);
    }
  }

  const handleInputChange = (field: keyof UpdateProfileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          Please login to view your profile.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load profile information.
        </Alert>
      </Container>
    );
  }


  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            margin: 'auto',
            bgcolor: 'primary.main',
            fontSize: '2rem',
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            My Profile
          </Typography>
          <Chip
            label={profile.role}
            color="primary"
            variant="outlined"
            icon={<PersonIcon />}
          />
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card> 
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between',alignItems:'center', mb: 3 }}>
              <Typography variant='h6' component="h2">
                Profile Information
              </Typography>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={updateLoading}
                  >
                    {updateLoading ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={updateLoading}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />


            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={isEditing ? editData.name : profile.name}
                  onChange={handleInputChange('name')}
                  variant="outlined"
                  fullWidth
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={profile.email}
                  variant="outlined"
                  fullWidth
                  disabled
                  helperText="Email cannot be changed"
                  sx={{ mb: 2 }}
                />
              </Grid>
              {isEditing && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="New Password"
                    type="password"
                    value={editData.password}
                    onChange={handleInputChange('password')}
                    variant="outlined"
                    fullWidth
                    helperText="Leave blank to keep current password"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Role"
                  value={profile.role}
                  fullWidth
                  disabled
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Member Since"
                  value={new Date(profile.createdAt).toLocaleDateString()}
                  fullWidth
                  disabled
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/orders')}
            sx={{ mt: 2 }}
          >
            View Order History
          </Button>
          <Button 
            variant='outlined'
            onClick={() => router.push('/wishlist')}
          >
            View WishList
            </Button>
        </Box>
        </Paper>
    </Container>
  )
}