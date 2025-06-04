'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { paymentStripeService } from '@/app/services/paymentStripe';

interface StripeContextType {
  stripe: Stripe | null;
  isLoading: boolean;
  error: string | null;
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  isLoading: true,
  error: null,
});

export const useStripe = () => {
  const context = useContext(StripeContext);
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Set timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setError('Stripe loading timeout - using fallback');
          setIsLoading(false);
        }, 10000); // 10 second timeout

        const stripeConfig = await paymentStripeService.getConfig();
        
        clearTimeout(timeoutId);
        
        if (stripeConfig.publishableKey) {
          const stripeInstance = await loadStripe(stripeConfig.publishableKey);
          setStripe(stripeInstance);
          setError(null);
        } else {
          setError('No Stripe publishable key found');
        }
      } catch (err: any) {
        console.warn('Stripe initialization failed:', err.message);
        setError(`Stripe unavailable: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, []);

  // this value wraps all the components that need access to the Stripe context
  const value: StripeContextType = {
    stripe,
    isLoading,
    error,
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        Loading payment system...
      </div>
    );
  }

  return (
    <StripeContext.Provider value={value}>
      {stripe && !error ? (
        <Elements stripe={stripe}>
          {children}
        </Elements>
      ) : (
        <div>Failed to load payment system</div>
      )}
    </StripeContext.Provider>
  );
}; 