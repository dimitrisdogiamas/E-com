'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardElementProps,
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { paymentStripeService } from '@/app/services/paymentStripe';
import { useAuth } from '@/app/components/context/AuthContext';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

const cardElementOptions: CardElementProps['options'] = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'Roboto, Arial, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();


    // authentication check
    if (!stripe || !elements || !token) {
      setError('Payment system not ready');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card information not found');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Create payment intent on backend
      const paymentIntent = await paymentStripeService.createPaymentIntent(
        { amount, currency: 'usd' },
        token
      );

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedPayment } =
        await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onPaymentError(stripeError.message || 'Payment failed');
      } else if (confirmedPayment?.status === 'succeeded') {
        // Step 3: Notify parent component
        onPaymentSuccess(confirmedPayment.id);
      } else {
        setError('Payment was not completed');
        onPaymentError('Payment was not completed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Payment Information
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <CardElement options={cardElementOptions} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            Total: ${amount.toFixed(2)}
          </Typography>
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!stripe || isProcessing || disabled}
            sx={{ minWidth: 150 }}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 