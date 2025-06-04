import axios from 'axios';
import { API_CONFIG } from '../config/api';

export async function getAllProducts() {
  const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
  return res.data;
}

export async function getProductById(id: string) {
  const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`)
  return res.data;
}