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
  }


  try {
    if (!token) return;


    // Only send fields that have changed 

    const updatePayload
  }

}