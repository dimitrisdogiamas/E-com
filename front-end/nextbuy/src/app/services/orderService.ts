import axios from 'axios';

const API_URL = 'http://localhost:4001';

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  paymentMethod: string;
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  shippingFullName: string;
  shippingAddress: string;
  shippingPhone: string;
  items?: OrderItem[];
}

export async function getMyOrders(token: string): Promise<Order[]> {
  const res = await axios.get(`${API_URL}/orders/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function getOrderById(orderId: string, token: string): Promise<Order> {
  const res = await axios.get(`${API_URL}/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
} 