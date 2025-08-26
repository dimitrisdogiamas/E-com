import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

export interface RecommendedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: {
    id: string;
    url: string;
    productId: string;
  }[];
  reviews: any[];
  variants: any[];
}

export async function getRecommendationsForUser(token: string, limit?: number): Promise<RecommendedProduct[]> {
  try {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axios.get(`${API_URL}/recommedation/me${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Recommendations error:', error);
    throw new Error('Failed to fetch recommendations');
  }
}

export async function getGeneralRecommendations(limit: number = 8): Promise<RecommendedProduct[]> {
  try {
    const response = await axios.get(`${API_URL}/recommedation/general?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('General recommendations error:', error);
    throw new Error('Failed to fetch general recommendations');
  }
}