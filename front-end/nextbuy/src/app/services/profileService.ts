import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  password?: string;
}

export async function getProfile(token: string): Promise<Profile> {
  const res = await axios.get(`${API_URL}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data.data; // Backend response
}

export async function updateProfile(token: string, data: UpdateProfileData): Promise<Profile> {
  const res = await axios.patch(`${API_URL}/profile`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data.data;
}

export async function deleteProfile(token: string): Promise<void> {
  await axios.delete(`${API_URL}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}