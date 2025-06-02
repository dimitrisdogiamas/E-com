import axios from 'axios';

const API_URL = 'http://localhost:4001';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchSuggestions {
  products: string[];
  categories: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: ProductImage[];
}

export async function searchProducts(filters: SearchFilters): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    
    // if the query exists then add it to the params
     if (filters.query) params.append('q', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString()); 

    //  make an api get request to the search endpoint and convert the params to a string
    const response = await axios.get(`${API_URL}/search/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search products');
  }
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestions> {
  try {
    if (!query || query.length < 2) {
      // Return empty suggestions if query is too short
      return { products: [], categories: [] };
    }

    const response = await axios.get(`${API_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Search suggestions error:', error);
    return { products: [], categories: [] };
  }
} 