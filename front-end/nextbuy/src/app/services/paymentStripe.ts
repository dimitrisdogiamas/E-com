import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface StripeConfig {
  publishableKey: string;
}

class PaymentStripeService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Create payment intent for checkout
  async createPaymentIntent(
    data: CreatePaymentIntentRequest,
    token: string
  ): Promise<PaymentIntent> {
    try {
      const response = await axios.post(
        `${API_URL}/payment/create-intent`,
        {
          amount: data.amount,
          currency: data.currency || 'usd',
        },
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  }

  // Confirm payment after Stripe processing
  async confirmPayment(
    data: ConfirmPaymentRequest,
    token: string
  ): Promise<PaymentIntent> {
    try {
      const response = await axios.post(
        `${API_URL}/payment/confirm`,
        data,
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  }

  // Get Stripe publishable key
  async getStripeConfig(): Promise<StripeConfig> {
    try {
      const response = await axios.get(`${API_URL}/payment/config`);
      return response.data;
    } catch (error) {
      console.error('Get Stripe config error:', error);
      throw error;
    }
  }
}

export const paymentStripeService = new PaymentStripeService();
export default paymentStripeService;




