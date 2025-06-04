import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: 'http://localhost:4001', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor (για να προσθέτουμε token αυτόματα αν χρειάζεται)
apiClient.interceptors.request.use(
  (config) => {
    // Μπορούμε να προσθέσουμε εδώ logic για auto token injection
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (για error handling)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - μπορεί να redirect στο login
      console.warn('Unauthorized access - redirecting to login');
    } else if (error.response?.status === 403) {
      // Forbidden
      console.warn('Access forbidden');
    } else if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response?.data?.message || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 