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
    // Check stock availability before adding to cart
    const stockInfo = await checkVariantStock(token, variantId);
    
    if (stockInfo.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${stockInfo.stock}, Requested: ${quantity}`);
    }

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
    if (error.message.includes('Insufficient stock')) {
      throw error; // Re-throw stock error with original message
    }
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

// Stock management functions
export interface StockInfo {
  variantId: string;
  stock: number;
  sku: string;
  productName: string;
}

export async function checkVariantStock(token: string, variantId: string): Promise<StockInfo> {
  try {
    const response = await axios.get(`${API_URL}/orders/check-stock/${variantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Check stock error:', error);
    throw new Error('Failed to check stock availability');
  }
}

export async function checkMultipleVariantsStock(token: string, variantIds: string[]): Promise<StockInfo[]> {
  try {
    const stockPromises = variantIds.map(id => checkVariantStock(token, id));
    return await Promise.all(stockPromises);
  } catch (error) {
    console.error('Check multiple stocks error:', error);
    throw new Error('Failed to check stock for multiple variants');
  }
}

// Helper function to validate cart items stock
export async function validateCartStock(token: string): Promise<{ valid: boolean; issues: string[] }> {
  try {
    const cart = await getCart(token);
    const issues: string[] = [];
    
    for (const item of cart.items) {
      const stockInfo = await checkVariantStock(token, item.variant.id);
      
      if (stockInfo.stock < item.quantity) {
        issues.push(
          `${stockInfo.productName}: Only ${stockInfo.stock} available, but ${item.quantity} in cart`
        );
      }
    }
    
    return { valid: issues.length === 0, issues };
  } catch (error) {
    console.error('Validate cart stock error:', error);
    return { valid: false, issues: ['Failed to validate cart stock'] };
  }
}

// Helper function to add product to cart by productId (gets first variant automatically)
export async function addProductToCart(productId: string, quantity: number, token: string): Promise<Cart> {
  try {
    // Get product details to find first variant
    const response = await fetch(`${API_URL}/products/${productId}`);
    const productDetails = await response.json();
    
    if (productDetails.variants && productDetails.variants.length > 0) {
      const firstVariant = productDetails.variants[0];
      return await addToCart(token, firstVariant.id, quantity);
    } else {
      throw new Error('No variants available for this product');
    }
  } catch (error) {
    console.error('Add product to cart error:', error);
    throw new Error('Failed to add product to cart');
  }
} 