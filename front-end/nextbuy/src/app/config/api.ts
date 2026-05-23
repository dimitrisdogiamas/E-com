const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
  ),
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
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${path}`;
};

export default API_CONFIG; 