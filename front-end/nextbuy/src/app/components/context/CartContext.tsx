'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart, type Cart } from '@/app/services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  cartItemsCount: number;
  refreshCart: () => Promise<void>;
  setCartItemsCount: (count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const refreshCart = async () => {
    if (user && token) {
      try {
        const cartData = await getCart(token);
        setCart(cartData);
        const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemsCount(totalItems);
      } catch (error) {
        console.warn('Failed to load cart:', error);
        setCart(null);
        setCartItemsCount(0);
      }
    } else {
      setCart(null);
      setCartItemsCount(0);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user, token]);

  return (
    <CartContext.Provider value={{
      cart,
      cartItemsCount,
      refreshCart,
      setCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 