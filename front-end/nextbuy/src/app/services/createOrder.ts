import axios from 'axios';



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



export async function createOrder(orderData: OrderData, token: string) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, orderData,
    {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data; // επιστρέφει το response απο το backend
  } catch (error) {
    // error handling
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'An error occured while creating the order');
    }
    throw error;
  }

}