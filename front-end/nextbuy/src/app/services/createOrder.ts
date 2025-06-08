import axios from 'axios';
import { getCart } from './cartService';

const API_URL = 'http://localhost:4001';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

// add the shipping details 
interface ShippingDetails {
  fullName: string;
  address: string;
  phone: string;
}

interface OrderData {
  items: OrderItem[];
  total: number;
  shippingDetails: ShippingDetails;
  paymentMethod: string;
}

// Backend expected format
interface BackendOrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

interface BackendOrderData {
  paymentMethod: string;
  totalAmount: number;
  shippingFullName: string;
  shippingAddress: string;
  shippingPhone: string;
  items: BackendOrderItem[];
}

export async function createOrder(orderData: OrderData, token: string) {
  try {
    // Get the real cart from backend instead of using fake data
    const realCart = await getCart(token);
    
    // Transform real cart data to backend format
    const backendOrderData: BackendOrderData = {
      paymentMethod: orderData.paymentMethod === 'creditCard' ? 'Stripe' : 'Cash On Delivery',
      totalAmount: realCart.total, // Use real cart total
      shippingFullName: orderData.shippingDetails.fullName,
      shippingAddress: orderData.shippingDetails.address,
      shippingPhone: orderData.shippingDetails.phone,
      items: realCart.items.map(item => ({
        productId: item.variant.product.id, // Use real product ID
        variantId: item.variant.id, // Use real variant ID
        quantity: item.quantity,
        price: item.variant.price || item.variant.product.price
      }))
    };

    const response = await axios.post(`${API_URL}/orders`, backendOrderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    return response.data; // επιστρέφει το response απο το backend
  } catch (error) {
    // error handling
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'An error occurred while creating the order');
    }
    throw error;
  }
}