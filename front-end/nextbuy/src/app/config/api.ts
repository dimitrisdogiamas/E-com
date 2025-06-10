// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
  ENDPOINTS: {
    AUTH: '/auth',
    PRODUCTS: '/products',
    CART: '/cart',
    ORDERS: '/orders',
    PAYMENT: '/payment',
    PROFILE: '/profile',
    WISHLIST: '/wishlist',
    REVIEWS: '/reviews',
    SEARCH: '/search',
    RECOMMENDATIONS: '/recommedation',
    UPLOAD: '/upload',
    ADMIN: '/admin',
  }
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG; 