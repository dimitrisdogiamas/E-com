'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { paymentStripeService } from '@/app/services/paymentStripe';

interface StripeContextType {
  stripe: Stripe | null;
  publishableKey: string | null;
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  publishableKey: null,
});

export const useStripe = () => {
  const context = useContext(StripeContext); // passing data to the component tree
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

// this is the child component that will provide the Stripe context to the rest of the app
interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Get publishable key from backend
        const config = await paymentStripeService.getStripeConfig();
        setPublishableKey(config.publishableKey);

        // Load Stripe
        const stripeInstance = await loadStripe(config.publishableKey);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  // this value wraps all the components that need access to the Stripe context
  const value = {
    stripe,
    publishableKey,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        Loading payment system...
      </div>
    );
  }

  return (
    <StripeContext.Provider value={value}>
      {stripe && publishableKey ? (
        <Elements stripe={stripe}>
          {children}
        </Elements>
      ) : (
        <div>Failed to load payment system</div>
      )}
    </StripeContext.Provider>
  );
}; 