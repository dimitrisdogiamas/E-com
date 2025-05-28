import axios from 'axios';

const API_URL = 'http://localhost:4000';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: Array<{
      id: string;
      url: string;
    }>;
  };
  createdAt: string;
}

// Get user's wishlist
export async function getWishlist(token: string): Promise<WishlistItem[]> {
  const response = await axios.get(`${API_URL}/wishlist`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Add product to wishlist
export async function addToWishlist(productId: string, token: string) {
  const response = await axios.post(
    `${API_URL}/wishlist`,
    { productId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// Remove product from wishlist
export async function removeFromWishlist(productId: string, token: string) {
  const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
} 