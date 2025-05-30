import axios from 'axios';

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
    // Transform frontend data to backend format
    const backendOrderData: BackendOrderData = {
      paymentMethod: orderData.paymentMethod === 'creditCard' ? 'Stripe' : 'Cash On Delivery',
      totalAmount: orderData.total,
      shippingFullName: orderData.shippingDetails.fullName,
      shippingAddress: orderData.shippingDetails.address,
      shippingPhone: orderData.shippingDetails.phone,
      items: orderData.items.map(item => ({
        productId: item.id.toString(), // Convert to string as backend expects
        variantId: generateVariantId(item.id), // Generate a variant ID (temporary solution)
        quantity: item.quantity,
        price: item.price
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

// Temporary function to generate variant ID
// In a real app, this should come from the product selection
function generateVariantId(productId: number): string {
  // For now, we'll use the productId as variantId
  // In the future, this should be selected by the user from product variants
  return `variant-${productId}`;
}