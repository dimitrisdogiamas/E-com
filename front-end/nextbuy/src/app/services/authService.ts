// We need to connect to the backend for the authentication
import { LoginResponse } from '../types/auth';
import axios from 'axios';
// setting the api url
const API_URL = 'http://localhost:4001';

export async function login(email: string, password: string) {
  const res = await axios.post<LoginResponse>(`${API_URL}/auth/login`, { email, password })
  return res.data; // {token και user }
}

export async function register(email: string, password: string, name: string) {
  await axios.post(`${API_URL}/auth/register`, {email, password,name})
}