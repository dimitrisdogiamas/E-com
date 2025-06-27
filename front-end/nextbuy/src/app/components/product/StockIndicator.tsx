'use client';

import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { 
  CheckCircle as InStockIcon, 
  Warning as LowStockIcon, 
  Cancel as OutOfStockIcon 
} from '@mui/icons-material';

interface StockIndicatorProps {
  stock: number;
  variant?: 'chip' | 'text' | 'detailed';
  lowStockThreshold?: number;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function StockIndicator({
  stock,
  variant = 'chip',
  lowStockThreshold = 10,
  showIcon = true,
  size = 'medium'
}: StockIndicatorProps) {
  
  const getStockStatus = () => {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockConfig = () => {
    const status = getStockStatus();
    
    switch (status) {
      case 'out-of-stock':
        return {
          label: 'Out of Stock',
          color: 'error' as const,
          icon: <OutOfStockIcon />,
          textColor: '#d32f2f'
        };
      case 'low-stock':
        return {
          label: `Only ${stock} left`,
          color: 'warning' as const,
          icon: <LowStockIcon />,
          textColor: '#ed6c02'
        };
      default:
        return {
          label: 'In Stock',
          color: 'success' as const,
          icon: <InStockIcon />,
          textColor: '#2e7d32'
        };
    }
  };

  const stockConfig = getStockConfig();

  if (variant === 'chip') {
    return (
      <Chip
        label={stockConfig.label}
        color={stockConfig.color}
        size={size === 'large' ? 'medium' : 'small'}
        icon={showIcon ? stockConfig.icon : undefined}
        sx={{
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          fontWeight: 500
        }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <Typography
        variant={size === 'small' ? 'caption' : 'body2'}
        sx={{
          color: stockConfig.textColor,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        {showIcon && (
          <Box
            component="span"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: size === 'small' ? '16px' : '20px'
            }}
          >
            {stockConfig.icon}
          </Box>
        )}
        {stockConfig.label}
      </Typography>
    );
  }

  if (variant === 'detailed') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          sx={{
            color: stockConfig.textColor,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          {showIcon && (
            <Box
              component="span"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: size === 'small' ? '16px' : '20px'
              }}
            >
              {stockConfig.icon}
            </Box>
          )}
          {stockConfig.label}
        </Typography>
        
        {stock > 0 && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem'
            }}
          >
            {stock} units available
          </Typography>
        )}
      </Box>
    );
  }

  return null;
}

// Helper component for product cards
export function ProductStockBadge({ stock }: { stock: number }) {
  return (
    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
      <StockIndicator 
        stock={stock} 
        variant="chip" 
        size="small" 
        lowStockThreshold={5}
      />
    </Box>
  );
}

// Helper component for cart items
export function CartStockWarning({ stock, requestedQuantity }: { stock: number; requestedQuantity: number }) {
  if (stock >= requestedQuantity) return null;

  return (
    <Box 
      sx={{ 
        mt: 1, 
        p: 1, 
        backgroundColor: 'warning.light',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'warning.main'
      }}
    >
      <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 500 }}>
        ⚠️ Only {stock} left in stock! Please reduce quantity.
      </Typography>
    </Box>
  );
} 