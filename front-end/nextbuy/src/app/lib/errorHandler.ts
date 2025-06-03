export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const getErrorMessage = (error: any): string => {
  // Handle Axios errors
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle Axios network errors
  if (error?.response?.statusText) {
    return `Server Error: ${error.response.statusText}`;
  }
  
  // Handle standard Error objects
  if (error?.message) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback for unknown error types
  return 'An unexpected error occurred';
};

export const getStatusCodeMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'You need to login to access this resource.';
    case 403:
      return 'You don\'t have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource already exists.';
    case 422:
      return 'Invalid data provided.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return `Server returned status ${status}`;
  }
};

export const handleApiError = (error: any): ApiError => {
  const status = error?.response?.status;
  let message = getErrorMessage(error);
  
  // If we have a status code but the error message isn't helpful, use status message
  if (status && (!message || message === 'Request failed')) {
    message = getStatusCodeMessage(status);
  }
  
  return {
    message,
    status,
    code: error?.response?.data?.code || error?.code,
  };
};

// Hook for error handling in components
export const useErrorHandler = () => {
  const handleError = (error: any, fallbackMessage?: string): string => {
    const apiError = handleApiError(error);
    
    // Log error for debugging
    console.error('Error occurred:', error);
    
    return fallbackMessage && apiError.message === 'An unexpected error occurred' 
      ? fallbackMessage 
      : apiError.message;
  };
  
  return { handleError };
}; 