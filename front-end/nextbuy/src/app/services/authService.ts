// We need to connect to the backend for the authentication
import { LoginResponse } from '../types/auth';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

export async function login(email: string, password: string) {
  const res = await axios.post<LoginResponse>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/login`, { email, password })
  return res.data; // {token και user }
}

export async function register(email: string, password: string, name: string) {
  await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/register`, {email, password,name})
}