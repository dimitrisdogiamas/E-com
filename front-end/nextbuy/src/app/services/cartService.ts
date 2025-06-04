import axios from 'axios';

const API_URL = 'http://localhost:4001';

export interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: number;
    stock: number;
    product: {
      id: string;
      name: string;
      price: number;
      images: {
        id: string;
        url: string;
      }[];
    };
    size: {
      id: string;
      name: string;
    };
    color: {
      id: string;
      name: string;
      hexCode: string;
    };
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export async function getCart(token: string): Promise<Cart> {
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get cart error:', error);
    throw new Error('Failed to fetch cart');
  }
}

export async function addToCart(token: string, variantId: string, quantity: number): Promise<Cart> {
  try {
    const response = await axios.post(`${API_URL}/cart/add`, 
      { variantId, quantity },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw new Error('Failed to add item to cart');
  }
}

export async function updateCartItem(token: string, variantId: string, quantity: number): Promise<Cart> {
  try {
    const response = await axios.post(`${API_URL}/cart/update`, 
      { variantId, quantity },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update cart error:', error);
    throw new Error('Failed to update cart item');
  }
}

export async function removeFromCart(token: string, variantId: string): Promise<Cart> {
  try {
    const response = await axios.delete(`${API_URL}/cart/remove/${variantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw new Error('Failed to remove item from cart');
  }
}

export async function clearCart(token: string): Promise<Cart> {
  try {
    const response = await axios.delete(`${API_URL}/cart/clear`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw new Error('Failed to clear cart');
  }
} 