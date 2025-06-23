# 🎨 NextBuy Frontend Documentation

## Overview

NextBuy frontend is built with **Next.js 14**, **React 18**, and **Material-UI**, providing a modern, responsive e-commerce experience with 21 comprehensive pages.

## 🏗️ Architecture

```
src/app/
├── components/           # Reusable UI components
│   ├── context/         # React contexts (Auth, Cart, Theme)
│   ├── layout/          # Layout components
│   └── ui/              # Common UI components
├── services/            # API service layer
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── pages/               # Next.js App Router pages (21 pages)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand + React Context
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Payments**: Stripe React Components
- **File Upload**: React Dropzone
- **Date Handling**: date-fns
- **Testing**: Jest + React Testing Library

## 📱 Application Pages (21 Total)

### Core E-commerce Pages
1. **`/`** - Home page with featured products
2. **`/products`** - Product catalog with filters
3. **`/products/[id]`** - Product details page
4. **`/cart`** - Shopping cart management
5. **`/checkout`** - Payment and order placement
6. **`/orders`** - Order history and tracking
7. **`/wishlist`** - Saved products list

### User Management
8. **`/auth/login`** - User login
9. **`/auth/register`** - User registration
10. **`/profile`** - User profile management

### Communication
11. **`/chat`** - Real-time chat interface

### Admin Pages
12. **`/admin`** - Admin dashboard
13. **`/admin/products`** - Product management
14. **`/admin/orders`** - Order management
15. **`/admin/users`** - User management

### Utility Pages
16. **`/search`** - Search results page
17. **`/categories/[category]`** - Category-specific products
18. **`/about`** - About page
19. **`/contact`** - Contact information
20. **`/privacy`** - Privacy policy
21. **`/terms`** - Terms of service

## 🎯 Key Features

### 🔐 Authentication System
```typescript
// Authentication Context
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Login, logout, register functions
};
```

**Features:**
- JWT token management
- Google OAuth integration
- Persistent login state
- Role-based access control
- Automatic token refresh

### 🛒 Shopping Cart
```typescript
// Cart Context
const useCart = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  
  // Add, remove, update cart functions
};
```

**Features:**
- Real-time cart synchronization
- Persistent cart across sessions
- Quantity management
- Price calculations
- Cart item validation

### 🎨 Theme Management
```typescript
// Theme Context
const useTheme = () => {
  const [mode, setMode] = useState('light');
  
  // Toggle theme, customize colors
};
```

**Features:**
- Light/Dark mode toggle
- Material-UI theme customization
- Persistent theme preference
- Responsive design tokens

### 💬 Real-time Chat
```typescript
// Socket Hook
const useSocket = (token: string) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Connection management, message handling
};
```

**Features:**
- WebSocket authentication
- Real-time messaging
- Connection status monitoring
- Message history
- Room-based chat

## 🧩 Component Structure

### Layout Components

#### `ClientLayout`
Main layout wrapper with navigation and theme provider.

```typescript
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
```

#### `Navigation`
Responsive navigation with user menu and cart indicator.

```typescript
const Navigation = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  
  return (
    <AppBar position="sticky">
      {/* Navigation items */}
      <Badge badgeContent={itemCount} color="secondary">
        <ShoppingCartIcon />
      </Badge>
    </AppBar>
  );
};
```

### Page Components

#### Product Catalog (`/products`)
```typescript
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Filtering, pagination, search logic
  
  return (
    <Container>
      <ProductFilters onFilterChange={setFilters} />
      <ProductGrid products={products} loading={loading} />
      <Pagination />
    </Container>
  );
}
```

#### Shopping Cart (`/cart`)
```typescript
export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  
  return (
    <Container>
      <Typography variant="h4">Shopping Cart</Typography>
      {items.map(item => (
        <CartItem 
          key={item.id}
          item={item}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
        />
      ))}
      <CheckoutButton total={total} />
    </Container>
  );
}
```

## 🔌 API Integration

### Service Layer
```typescript
// services/api.ts
class ApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;
  
  async request(endpoint: string, options: RequestOptions) {
    const token = getAuthToken();
    const response = await axios.request({
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      ...options
    });
    
    return response.data;
  }
}
```

### Service Modules
- **`authService.ts`** - Authentication operations
- **`productService.ts`** - Product CRUD operations
- **`cartService.ts`** - Cart management
- **`orderService.ts`** - Order processing
- **`wishlistService.ts`** - Wishlist operations
- **`paymentService.ts`** - Stripe integration

## 💳 Payment Integration

### Stripe Setup
```typescript
// components/checkout/PaymentForm.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      }
    );
    
    // Handle payment result
  };
}
```

## 🎭 State Management

### Zustand Store
```typescript
// stores/appStore.ts
interface AppState {
  // Global app state
  loading: boolean;
  error: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  loading: false,
  error: null,
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```

### React Context Providers
```typescript
// contexts/AuthContext.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    setToken(response.accessToken);
    localStorage.setItem('token', response.accessToken);
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '../components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 29.99,
    image: 'test-image.jpg'
  };
  
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// __tests__/pages/cart.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CartPage from '../pages/cart';
import { CartProvider } from '../contexts/CartContext';

describe('Cart Page', () => {
  it('allows user to update item quantities', async () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );
    
    const quantityInput = screen.getByLabelText('Quantity');
    fireEvent.change(quantityInput, { target: { value: '3' } });
    
    // Assert quantity update
  });
});
```

## 📱 Responsive Design

### Breakpoints
```typescript
// Material-UI theme breakpoints
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,     // Mobile
      sm: 600,   // Tablet
      md: 900,   // Desktop
      lg: 1200,  // Large Desktop
      xl: 1536,  // Extra Large
    },
  },
});
```

### Responsive Components
```typescript
// components/ProductGrid.tsx
export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <Grid container spacing={2}>
      {products.map(product => (
        <Grid 
          item 
          xs={12}  // 1 column on mobile
          sm={6}   // 2 columns on tablet
          md={4}   // 3 columns on desktop
          lg={3}   // 4 columns on large desktop
          key={product.id}
        >
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
}
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for large components
const AdminDashboard = dynamic(() => import('../components/AdminDashboard'), {
  loading: () => <CircularProgress />,
  ssr: false
});
```

### Image Optimization
```typescript
// Next.js Image component
import Image from 'next/image';

export default function ProductImage({ src, alt }: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### Memoization
```typescript
// React.memo for expensive components
const ProductCard = React.memo(({ product }: ProductCardProps) => {
  return (
    <Card>
      {/* Product card content */}
    </Card>
  );
});

// useMemo for expensive calculations
const filteredProducts = useMemo(() => {
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [products, searchTerm]);
```

## 🔧 Environment Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'your-domain.com'],
  },
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Testing
npm test
npm run test:watch
npm run test:coverage
```

## 📦 Build & Deployment

### Build Process
```bash
# Build optimization
npm run build
# - Compiles TypeScript
# - Optimizes bundles
# - Generates static assets
# - Creates production build
```

### Deployment Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**

### Deployment Configuration
```javascript
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

## 🐛 Debugging & Monitoring

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### Performance Monitoring
```typescript
// utils/analytics.ts
export const trackEvent = (eventName: string, properties: any) => {
  // Analytics implementation
  if (typeof window !== 'undefined') {
    // Google Analytics, Mixpanel, etc.
  }
};
```

## 🔒 Security Considerations

- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: CSRF tokens for forms
- **Content Security Policy**: CSP headers
- **Secure Storage**: Secure token storage
- **Input Validation**: Client-side validation
- **HTTPS Only**: Secure communication

## 📚 Best Practices

1. **Component Design**: Small, reusable components
2. **Type Safety**: Comprehensive TypeScript usage
3. **Performance**: Lazy loading and code splitting
4. **Accessibility**: ARIA labels and semantic HTML
5. **SEO**: Meta tags and structured data
6. **Testing**: Comprehensive test coverage
7. **Error Handling**: Graceful error states
8. **User Experience**: Loading states and feedback

## 🤝 Contributing

1. Use TypeScript for all new components
2. Follow Material-UI design system
3. Write tests for new features
4. Use conventional commit messages
5. Follow ESLint and Prettier rules
6. Document complex components 