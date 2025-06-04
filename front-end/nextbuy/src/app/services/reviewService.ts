import axios from 'axios';

const API_URL = 'http://localhost:4001';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  product?: {
    id: string;
    name: string;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  averageRating: number;
  totalReviews: number;
}

export async function getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
  try {
    const response = await axios.get(`${API_URL}/reviews/product/${productId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get product reviews error:', error);
    throw new Error('Failed to fetch product reviews');
  }
}

export async function createReview(token: string, productId: string, rating: number, comment: string): Promise<Review> {
  try {
    const response = await axios.post(`${API_URL}/reviews`, 
      { productId, rating, comment },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Create review error:', error);
    throw new Error('Failed to create review');
  }
}

export async function updateReview(token: string, reviewId: string, rating?: number, comment?: string): Promise<Review> {
  try {
    const response = await axios.put(`${API_URL}/reviews/${reviewId}`, 
      { rating, comment },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update review error:', error);
    throw new Error('Failed to update review');
  }
}

export async function deleteReview(token: string, reviewId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Delete review error:', error);
    throw new Error('Failed to delete review');
  }
}

export async function getUserReviews(token: string): Promise<Review[]> {
  try {
    const response = await axios.get(`${API_URL}/reviews/user/my`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get user reviews error:', error);
    throw new Error('Failed to fetch user reviews');
  }
} 