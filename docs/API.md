# 📡 NextBuy API Documentation

## 🌐 Base URL
```
Development: http://localhost:4001
Production: https://nextbuy-backend.railway.app
```

## 🔐 Authentication

### Bearer Token Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
All API responses follow this standardized structure:

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "statusCode": 200
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": []
}
```

---

## 🔑 Authentication Endpoints

### POST /auth/login
User login with email and password.

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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials
- `400`: Validation error

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

**Validation Rules:**
- Email: Valid email format, unique
- Password: Minimum 6 characters
- Name: Required, non-empty string

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Google OAuth Endpoints

#### GET /oauth/google
Initiate Google OAuth login flow.

**Response:** Redirects to Google OAuth consent screen.

#### GET /oauth/google/callback
Google OAuth callback endpoint.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: Optional state parameter

**Response:** Sets JWT cookie and returns user data.

#### GET /oauth/profile
Get authenticated user profile via OAuth.

**Headers:** `Authorization: Bearer <token>`

---

## 👤 User Management

### GET /users/me
Get current authenticated user profile.

**Authentication:** Required
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /users
Get all users (Admin only).

**Authentication:** Required (Admin role)
**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### PATCH /users/update-password
Update user password.

**Authentication:** Required
**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "new_password_123"
}
```

---

## 🛍️ Product Management

### GET /products
Get all products with optional filtering.

**Query Parameters:**
- `category`: Filter by category name
- `minPrice`: Minimum price filter (number)
- `maxPrice`: Maximum price filter (number)
- `search`: Search term for name/description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Premium T-Shirt",
    "description": "High-quality cotton t-shirt",
    "price": 29.99,
    "category": "T-Shirts",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "images": [
      {
        "id": "uuid",
        "url": "https://example.com/image.jpg"
      }
    ],
    "variants": [
      {
        "id": "uuid",
        "sku": "TSHIRT-M-BLACK",
        "stock": 50,
        "price": 29.99,
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
    ],
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Great product!",
        "user": {
          "id": "uuid",
          "name": "John Doe"
        }
      }
    ]
  }
]
```

### GET /products/:id
Get a specific product by ID.

**Parameters:**
- `id`: Product UUID

**Response:** Single product object with full details.

### POST /products
Create a new product (Admin only).

**Authentication:** Required (Admin role)
**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "category": "Electronics"
}
```

### PATCH /products/:id
Update an existing product (Admin only).

**Authentication:** Required (Admin role)
**Parameters:**
- `id`: Product UUID

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 59.99,
  "category": "Updated Category"
}
```

### DELETE /products/:id
Delete a product (Admin only).

**Authentication:** Required (Admin role)
**Parameters:**
- `id`: Product UUID

---

## 🛒 Cart Management

### GET /cart
Get user's current cart.

**Authentication:** Required
**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "quantity": 2,
      "variant": {
        "id": "uuid",
        "sku": "TSHIRT-M-BLACK",
        "price": 29.99,
        "stock": 50,
        "product": {
          "id": "uuid",
          "name": "Premium T-Shirt",
          "images": [
            {
              "url": "https://example.com/image.jpg"
            }
          ]
        },
        "size": {
          "name": "M"
        },
        "color": {
          "name": "Black",
          "hexCode": "#000000"
        }
      }
    }
  ]
}
```

### POST /cart/add
Add item to cart.

**Authentication:** Required
**Request Body:**
```json
{
  "variantId": "uuid",
  "quantity": 2
}
```

### POST /cart/update
Update cart item quantity.

**Authentication:** Required
**Request Body:**
```json
{
  "variantId": "uuid",
  "quantity": 3
}
```

### DELETE /cart/remove/:variantId
Remove item from cart.

**Authentication:** Required
**Parameters:**
- `variantId`: Product variant UUID

### DELETE /cart/clear
Clear entire cart.

**Authentication:** Required

---

## 📦 Order Management

### GET /orders/my
Get current user's orders.

**Authentication:** Required
**Response:**
```json
[
  {
    "id": "uuid",
    "orderNumber": "ORD-2024-001",
    "status": "PENDING",
    "totalAmount": 89.97,
    "paymentMethod": "stripe",
    "shippingFullName": "John Doe",
    "shippingAddress": "123 Main St, City, State 12345",
    "shippingPhone": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "quantity": 3,
        "price": 29.99,
        "variant": {
          "sku": "TSHIRT-M-BLACK",
          "product": {
            "name": "Premium T-Shirt"
          },
          "size": { "name": "M" },
          "color": { "name": "Black" }
        }
      }
    ]
  }
]
```

### GET /orders/:id
Get specific order details.

**Authentication:** Required
**Parameters:**
- `id`: Order UUID

### POST /orders
Create a new order.

**Authentication:** Required
**Request Body:**
```json
{
  "paymentMethod": "stripe",
  "totalAmount": 89.97,
  "shippingFullName": "John Doe",
  "shippingAddress": "123 Main St, City, State 12345",
  "shippingPhone": "+1234567890",
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 3,
      "price": 29.99
    }
  ]
}
```

**Features:**
- ✅ Stock validation before order creation
- ✅ Automatic stock decrement on order confirmation
- ✅ Transaction safety for atomic operations
- ✅ Email notifications
- ✅ Order number generation

### PATCH /orders/:id/status
Update order status.

**Authentication:** Required
**Parameters:**
- `id`: Order UUID

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Valid Statuses:**
- `PENDING`: Order placed, awaiting processing
- `SHIPPED`: Order shipped to customer
- `DELIVERED`: Order delivered successfully
- `CANCELLED`: Order cancelled (automatically restocks items)

### GET /orders/check-stock/:variantId
Check stock availability for a product variant.

**Parameters:**
- `variantId`: Product variant UUID

**Response:**
```json
{
  "variantId": "uuid",
  "stock": 50,
  "available": true,
  "productName": "Premium T-Shirt",
  "sku": "TSHIRT-M-BLACK"
}
```

---

## 💳 Payment Management

### GET /payment/config
Get Stripe configuration for frontend.

**Response:**
```json
{
  "publishableKey": "pk_test_...",
  "currency": "usd"
}
```

### POST /payment/create-intent
Create Stripe payment intent.

**Authentication:** Required
**Request Body:**
```json
{
  "amount": 89.97,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_3L...secret",
  "paymentIntentId": "pi_3L..."
}
```

### POST /payment/confirm
Confirm payment completion.

**Authentication:** Required
**Request Body:**
```json
{
  "paymentIntentId": "pi_3L..."
}
```

---

## 🔍 Search & Recommendations

### GET /search/products
Search products with filters.

**Query Parameters:**
- `q`: Search query string
- `category`: Category filter
- `minPrice`: Minimum price (number)
- `maxPrice`: Maximum price (number)

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Premium T-Shirt",
      "price": 29.99,
      "category": "T-Shirts",
      "relevanceScore": 0.95
    }
  ],
  "totalResults": 25,
  "searchTerm": "premium shirt"
}
```

### GET /search/suggestions
Get search suggestions.

**Query Parameters:**
- `q`: Partial search query

**Response:**
```json
{
  "suggestions": [
    "premium t-shirt",
    "premium jeans",
    "premium shoes"
  ]
}
```

### GET /recommedation/general
Get general product recommendations.

**Query Parameters:**
- `limit`: Number of recommendations (default: 8)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Trending Product",
    "price": 39.99,
    "category": "Popular",
    "recommendationScore": 0.87
  }
]
```

### GET /recommedation/me
Get personalized recommendations for authenticated user.

**Authentication:** Required
**Query Parameters:**
- `limit`: Number of recommendations (default: 10)

**Response:** Array of recommended products based on user behavior.

---

## ⭐ Review Management

### GET /reviews/product/:productId
Get reviews for a specific product.

**Parameters:**
- `productId`: Product UUID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Reviews per page (default: 10)

**Response:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excellent product quality!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "uuid",
        "name": "John Doe"
      }
    }
  ],
  "averageRating": 4.2,
  "totalReviews": 156,
  "ratingDistribution": {
    "5": 89,
    "4": 45,
    "3": 15,
    "2": 5,
    "1": 2
  }
}
```

### POST /reviews
Create a new product review.

**Authentication:** Required
**Request Body:**
```json
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Great product, highly recommended!"
}
```

**Validation:**
- Rating: Must be between 1-5
- User can only review each product once
- Product must exist

### PUT /reviews/:reviewId
Update an existing review.

**Authentication:** Required (Own reviews only)
**Parameters:**
- `reviewId`: Review UUID

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

### DELETE /reviews/:reviewId
Delete a review.

**Authentication:** Required (Own reviews only)
**Parameters:**
- `reviewId`: Review UUID

### GET /reviews/user/my
Get current user's reviews.

**Authentication:** Required
**Response:** Array of user's reviews with product information.

---

## ❤️ Wishlist Management

### GET /wishlist
Get user's wishlist.

**Authentication:** Required
**Response:**
```json
[
  {
    "id": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": "uuid",
      "name": "Wishlist Item",
      "price": 49.99,
      "images": [
        {
          "url": "https://example.com/image.jpg"
        }
      ]
    }
  }
]
```

### POST /wishlist
Add product to wishlist.

**Authentication:** Required
**Request Body:**
```json
{
  "productId": "uuid"
}
```

### DELETE /wishlist/:productId
Remove product from wishlist.

**Authentication:** Required
**Parameters:**
- `productId`: Product UUID

---

## 📁 File Upload Management

### POST /upload/single
Upload a single file.

**Authentication:** Required
**Content-Type:** `multipart/form-data`
**Form Data:**
- `file`: File to upload
- `folder`: Optional folder (`products`, `profiles`, `general`)

**File Restrictions:**
- Max size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP
- Automatic filename generation

**Response:**
```json
{
  "url": "https://domain.com/uploads/products/unique-filename.jpg",
  "filename": "unique-filename.jpg",
  "size": 1024000,
  "mimetype": "image/jpeg"
}
```

### POST /upload/multiple
Upload multiple files.

**Authentication:** Required
**Content-Type:** `multipart/form-data`
**Form Data:**
- `files`: Array of files
- `folder`: Optional folder

**Response:**
```json
{
  "uploaded": [
    {
      "url": "https://domain.com/uploads/products/file1.jpg",
      "filename": "file1.jpg"
    }
  ],
  "failed": []
}
```

### DELETE /upload/file
Delete an uploaded file.

**Authentication:** Required
**Request Body:**
```json
{
  "url": "https://domain.com/uploads/products/filename.jpg"
}
```

### GET /upload/files
Get list of uploaded files (Admin only).

**Authentication:** Required (Admin role)
**Query Parameters:**
- `folder`: Filter by folder
- `page`: Page number
- `limit`: Files per page

### GET /upload/stats
Get upload statistics (Admin only).

**Authentication:** Required (Admin role)
**Response:**
```json
{
  "totalFiles": 1250,
  "totalSize": "45.2 MB",
  "filesByType": {
    "image/jpeg": 800,
    "image/png": 350,
    "image/gif": 100
  },
  "filesByFolder": {
    "products": 900,
    "profiles": 250,
    "general": 100
  }
}
```

---

## 👨‍💼 Admin Management

### GET /admin/dashboard
Get admin dashboard statistics.

**Authentication:** Required (Admin role)
**Response:**
```json
{
  "users": {
    "total": 1250,
    "newThisMonth": 89,
    "activeUsers": 456
  },
  "orders": {
    "total": 3450,
    "pending": 23,
    "thisMonth": 234,
    "revenue": 45670.50
  },
  "products": {
    "total": 567,
    "lowStock": 12,
    "outOfStock": 3
  },
  "reviews": {
    "total": 890,
    "averageRating": 4.2,
    "pendingModeration": 5
  }
}
```

### GET /admin/users
Get all users with pagination.

**Authentication:** Required (Admin role)
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Users per page (default: 10)

### PUT /admin/users/:id/role
Update user role.

**Authentication:** Required (Admin role)
**Parameters:**
- `id`: User UUID

**Request Body:**
```json
{
  "role": "admin"
}
```

### DELETE /admin/users/:id
Delete a user account.

**Authentication:** Required (Admin role)
**Parameters:**
- `id`: User UUID

### GET /admin/orders
Get all orders with pagination.

**Authentication:** Required (Admin role)
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Orders per page (default: 10)

### PUT /admin/orders/:id/status
Update order status (Admin).

**Authentication:** Required (Admin role)
**Parameters:**
- `id`: Order UUID

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

### GET /admin/reviews
Get all reviews for moderation.

**Authentication:** Required (Admin role)
**Query Parameters:**
- `page`: Page number
- `limit`: Reviews per page

### PUT /admin/reviews/:reviewId/approve
Approve a review.

**Authentication:** Required (Admin role)
**Parameters:**
- `reviewId`: Review UUID

### PUT /admin/reviews/:reviewId/reject
Reject a review.

**Authentication:** Required (Admin role)
**Parameters:**
- `reviewId`: Review UUID

### DELETE /admin/reviews/:reviewId
Delete a review (Admin).

**Authentication:** Required (Admin role)
**Parameters:**
- `reviewId`: Review UUID

---

## 👤 Profile Management

### GET /profile
Get user profile information.

**Authentication:** Required
**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /profile
Create user profile.

**Authentication:** Required
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### PATCH /profile
Update user profile.

**Authentication:** Required
**Request Body:**
```json
{
  "name": "Updated Name",
  "password": "new_password123"
}
```

### DELETE /profile
Delete user profile.

**Authentication:** Required

---

## 💬 Real-time Chat (WebSocket)

### Connection
**URL:** `/socket.io/`
**Authentication:** JWT token in handshake auth or query

### Events

#### Client to Server Events

**`message`**
Send a message to a room.
```json
{
  "roomId": "room_123",
  "senderId": "user_uuid",
  "message": "Hello everyone!"
}
```

**`joinRoom`**
Join a chat room.
```json
"room_123"
```

**`saveMessage`**
Save message to database.
```json
{
  "roomId": "room_123",
  "senderId": "user_uuid",
  "receiverId": "user_uuid",
  "message": "Hello!",
  "type": "TEXT",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**`markMessageAsRead`**
Mark message as read.
```json
{
  "messageId": "message_uuid"
}
```

**`deleteMessage`**
Delete a message.
```json
{
  "messageId": "message_uuid"
}
```

**`getMessagesByRoom`**
Get messages for a room.
```json
{
  "roomId": "room_123",
  "take": 20,
  "skip": 0
}
```

**`getUserConversations`**
Get user's conversations.
```json
{
  "userId": "user_uuid"
}
```

**`editMessage`**
Edit a message.
```json
{
  "messageId": "message_uuid",
  "newMessage": "Updated message content"
}
```

#### Server to Client Events

**`connected`**
Connection confirmation.
```json
{
  "id": "socket_id",
  "user": {
    "id": "user_uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**`message`**
Broadcast message to room participants.

**`joinedRoom`**
User joined room notification.

**`messageSaved`**
Message saved confirmation.

**`messageMarkedAsRead`**
Message read status update.

**`messageDeleted`**
Message deletion notification.

**`messagesRetrieved`**
Room messages response.

**`conversationsRetrieved`**
User conversations response.

**`messageEdited`**
Message edit notification.

**`auth_error`**
Authentication error.
```json
{
  "message": "Invalid authentication token"
}
```

**`error`**
General error notification.
```json
{
  "message": "Error description"
}
```

---

## 📊 Status Codes

### Success Codes
- `200`: OK - Request successful
- `201`: Created - Resource created successfully
- `204`: No Content - Request successful, no content to return

### Client Error Codes
- `400`: Bad Request - Invalid request data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `422`: Unprocessable Entity - Validation error

### Server Error Codes
- `500`: Internal Server Error - Server error
- `502`: Bad Gateway - Server unavailable
- `503`: Service Unavailable - Service temporarily unavailable

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Google OAuth integration
- ✅ Role-based access control (User/Admin)
- ✅ Token expiration and refresh
- ✅ Secure cookie handling

### Data Validation
- ✅ Input validation with class-validator
- ✅ DTO-based request validation
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ File upload validation

### API Security
- ✅ CORS configuration
- ✅ Rate limiting (planned)
- ✅ Request size limits
- ✅ Secure headers
- ✅ Environment-based configuration

---

## 🚀 Rate Limiting

### Current Limits
- File uploads: 5MB per file
- Request payload: 10MB max
- WebSocket connections: Authenticated users only

### Planned Enhancements
- API rate limiting: 100 requests/minute per IP
- User-based rate limiting: 1000 requests/hour per user
- File upload rate limiting: 10 uploads/minute per user

---

## 📈 Performance Features

### Caching
- ✅ Database query optimization with Prisma
- ✅ Index-based fast queries
- ✅ Connection pooling

### Optimization
- ✅ Paginated responses
- ✅ Selective field loading
- ✅ Transaction-based operations
- ✅ Async/await patterns
- ✅ Error handling and logging

---

## 🛠️ Development Tools

### Testing
- Jest unit testing framework
- Supertest for API testing
- E2E testing capabilities
- Test coverage reporting

### Documentation
- Comprehensive API documentation
- Interactive API explorer (planned)
- Postman collection (planned)
- OpenAPI/Swagger integration (planned)

### Monitoring
- Structured logging with Winston
- Error tracking and reporting
- Performance monitoring
- Health check endpoints

---

## 📞 Support

For API support and questions:
- **Documentation**: This comprehensive guide
- **Issues**: GitHub repository issues
- **Development**: Local development server on `http://localhost:4001`

**Last Updated:** January 2024
**API Version:** 1.0.0 