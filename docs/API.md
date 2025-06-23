# 📡 NextBuy API Documentation

## Base URL
```
Development: http://localhost:4001
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "statusCode": 200
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": []
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

### GET /auth/google
Initiate Google OAuth login.

**Response:** Redirects to Google OAuth consent screen.

### GET /auth/google/callback
Google OAuth callback endpoint.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: Optional state parameter

**Response:** Redirects to frontend with JWT token.

---

## 👤 User Management

### GET /users/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PATCH /users/update-password
Update user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 🛍️ Product Management

### GET /products
Get all products with optional filters.

**Query Parameters:**
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `search`: Search term
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "category": "T-Shirts",
      "images": [
        {
          "id": "uuid",
          "url": "https://example.com/image.jpg"
        }
      ],
      "variants": [
        {
          "id": "uuid",
          "sku": "PROD-M-BLACK",
          "price": 29.99,
          "stock": 50,
          "size": {
            "id": "uuid",
            "name": "M"
          },
          "color": {
            "id": "uuid",
            "name": "Black",
            "hexCode": "#000000"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### GET /products/:id
Get single product details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "category": "T-Shirts",
    "images": [...],
    "variants": [...],
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Great product!",
        "user": {
          "name": "John Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### POST /products
Create new product (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "category": "T-Shirts"
}
```

### PATCH /products/:id
Update product (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 39.99
}
```

### DELETE /products/:id
Delete product (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

---

## 🛒 Shopping Cart

### GET /cart
Get user's shopping cart.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "quantity": 2,
        "variant": {
          "id": "uuid",
          "sku": "PROD-M-BLACK",
          "price": 29.99,
          "product": {
            "id": "uuid",
            "name": "Product Name",
            "images": [...]
          },
          "size": {
            "name": "M"
          },
          "color": {
            "name": "Black"
          }
        }
      }
    ],
    "total": 59.98,
    "itemCount": 2
  }
}
```

### POST /cart/add
Add item to cart.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "variantId": "uuid",
  "quantity": 2
}
```

### POST /cart/update
Update cart item quantity.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "variantId": "uuid",
  "quantity": 3
}
```

### DELETE /cart/remove/:variantId
Remove item from cart.

**Headers:** `Authorization: Bearer <token>`

### DELETE /cart/clear
Clear entire cart.

**Headers:** `Authorization: Bearer <token>`

---

## ❤️ Wishlist

### GET /wishlist
Get user's wishlist.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "product": {
        "id": "uuid",
        "name": "Product Name",
        "price": 29.99,
        "category": "T-Shirts",
        "images": [...]
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /wishlist
Add item to wishlist.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "uuid"
}
```

### DELETE /wishlist/:productId
Remove item from wishlist.

**Headers:** `Authorization: Bearer <token>`

---

## 📦 Order Management

### GET /orders/my
Get user's orders.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "total": 59.98,
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "quantity": 2,
          "price": 29.99,
          "variant": {
            "product": {
              "name": "Product Name"
            }
          }
        }
      ]
    }
  ]
}
```

### GET /orders/:id
Get specific order details.

**Headers:** `Authorization: Bearer <token>`

### POST /orders
Create new order.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentIntentId": "pi_stripe_payment_intent_id",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  }
}
```

---

## 💳 Payment

### GET /payment/config
Get Stripe publishable key.

**Response:**
```json
{
  "success": true,
  "data": {
    "publishableKey": "pk_test_..."
  }
}
```

### POST /payment/create-intent
Create payment intent.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 5998,
  "currency": "usd"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_..._secret_...",
    "paymentIntentId": "pi_..."
  }
}
```

### POST /payment/confirm
Confirm payment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentIntentId": "pi_..."
}
```

---

## 🔍 Search

### GET /search/products
Search products.

**Query Parameters:**
- `q`: Search query
- `category`: Filter by category
- `minPrice`: Minimum price
- `maxPrice`: Maximum price

### GET /search/suggestions
Get search suggestions.

**Query Parameters:**
- `q`: Search query

**Response:**
```json
{
  "success": true,
  "data": [
    "suggested search term 1",
    "suggested search term 2"
  ]
}
```

---

## 👑 Admin Endpoints

### GET /admin/dashboard
Get admin dashboard statistics.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalProducts": 250,
    "totalOrders": 500,
    "totalRevenue": 25000.50,
    "recentOrders": [...],
    "topProducts": [...]
  }
}
```

### GET /admin/users
Get all users (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

### PUT /admin/users/:id/role
Update user role (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### DELETE /admin/users/:id
Delete user (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

---

## 💬 Chat WebSocket Events

### Connection
Connect to WebSocket with authentication:
```javascript
const socket = io('http://localhost:4001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client to Server
- `sendMessage`: Send a message to a room
- `joinRoom`: Join a specific chat room
- `leaveRoom`: Leave a chat room
- `getMessagesByRoom`: Get message history for a room
- `getUserConversations`: Get user's conversations

#### Server to Client
- `messageReceived`: New message received
- `userJoined`: User joined room notification
- `userLeft`: User left room notification
- `error`: Error message

### Example Usage
```javascript
// Send message
socket.emit('sendMessage', {
  room: 'general',
  message: 'Hello everyone!'
});

// Listen for messages
socket.on('messageReceived', (data) => {
  console.log('New message:', data);
});

// Join room
socket.emit('joinRoom', { room: 'general' });
```

---

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## 🛡️ Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- Admin endpoints: 200 requests per minute

## 📝 Changelog

### v1.0.0
- Initial API release
- Authentication system
- Product management
- Shopping cart functionality
- Order processing
- Payment integration
- Real-time chat
- Admin dashboard 