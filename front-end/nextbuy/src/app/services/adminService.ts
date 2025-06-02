const API_BASE = 'http://localhost:4001';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  images: Array<{
    id: string;
    url: string;
    altText?: string;
  }>;
  _count: {
    wishListItems: number;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingFullName: string;
  shippingAddress: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      product: {
        id: string;
        name: string;
        price: number;
      };
    };
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
    wishList: number;
  };
}

export const adminService = {
  // Dashboard
  async getDashboardStats(token: string): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return response.json();
  },

  // Products
  async getProducts(token: string, page: number = 1, limit: number = 10) {
    const response = await fetch(`${API_BASE}/admin/products?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  },

  async createProduct(token: string, productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrls?: string[];
  }) {
    const response = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    return response.json();
  },

  async updateProduct(token: string, id: string, productData: any) {
    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    
    return response.json();
  },

  async deleteProduct(token: string, id: string) {
    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    return response.json();
  },

  // Orders
  async getOrders(token: string, page: number = 1, limit: number = 10) {
    const response = await fetch(`${API_BASE}/admin/orders?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    return response.json();
  },

  async updateOrderStatus(token: string, id: string, status: string) {
    const response = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    
    return response.json();
  },

  // Users
  async getUsers(token: string, page: number = 1, limit: number = 10) {
    const response = await fetch(`${API_BASE}/admin/users?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  },

  async updateUserRole(token: string, id: string, role: string) {
    const response = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user role');
    }
    
    return response.json();
  },

  async deleteUser(token: string, id: string) {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    return response.json();
  },
}; 