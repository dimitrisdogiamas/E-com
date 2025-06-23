# 🛍️ NextBuy - Modern E-commerce Platform

A full-stack e-commerce platform built with modern technologies, featuring a comprehensive product management system, secure authentication, payment processing, and admin dashboard.

![NextBuy Banner](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop&crop=center)

## ✨ Features

### 🛒 **Core E-commerce Functionality**
- **Product Catalog** - Browse products across multiple categories with high-quality images
- **Product Variants** - Size and color options with individual SKUs and stock management
- **Shopping Cart** - Add, update, and remove items with real-time synchronization
- **Wishlist** - Save favorite products for later purchase
- **Secure Checkout** - Streamlined checkout process with order tracking

### 🔐 **Authentication & Security**
- **JWT Authentication** - Secure login/logout with token-based authentication
- **Role-based Access** - User and Admin roles with different permissions
- **Password Security** - Bcrypt encryption for secure password storage
- **Protected Routes** - Middleware-based route protection

### 💳 **Payment & Orders**
- **Stripe Integration** - Secure payment processing with test mode
- **Order Management** - Complete order lifecycle with status tracking
- **Email Notifications** - Automated order confirmations and updates
- **Order History** - Users can view their complete purchase history

### 🎛️ **Admin Dashboard**
- **Product Management** - Create, edit, and manage products and variants
- **Order Tracking** - Monitor all orders with status updates
- **User Management** - View and manage registered users
- **Analytics Dashboard** - Sales metrics and performance insights
- **Inventory Management** - Stock tracking and low inventory alerts

### 🎨 **Modern UI/UX**
- **Responsive Design** - Mobile-first approach with Material-UI components
- **Dark/Light Theme** - User preference theme switching
- **Intuitive Navigation** - Clean and modern interface design
- **Loading States** - Smooth loading indicators and skeleton screens
- **Error Handling** - Comprehensive error messages and fallbacks

## 🛠️ Technology Stack

### **Backend**
- **Node.js** & **Express.js** - Server framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database management and migrations
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Stripe API** - Payment processing
- **Nodemailer** - Email notifications

### **Frontend**
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client
- **Context API** - State management
- **React Hook Form** - Form handling

### **Development & Deployment**
- **ESLint** & **Prettier** - Code quality and formatting
- **Docker** - Containerization
- **Railway** - Cloud deployment
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nextbuy.git
cd nextbuy
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd front-end/nextbuy
npm install
cd ../..
```

4. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
DATABASE_URL="postgresql://username:password@localhost:5432/nextbuy"
JWT_SECRET="your-jwt-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

5. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed
```

6. **Start the application**
```bash
# Terminal 1: Start backend (port 4001)
npm run dev

# Terminal 2: Start frontend (port 3000)
cd front-end/nextbuy
npm run dev
```

## 📱 Usage

### **User Flow**
1. **Browse Products** - Explore the product catalog
2. **Product Details** - View detailed product information and variants
3. **Add to Cart/Wishlist** - Save items for purchase or later
4. **Secure Checkout** - Complete purchase with Stripe
5. **Order Tracking** - Monitor order status and history

### **Admin Flow**
1. **Login as Admin** - Access admin dashboard
2. **Manage Products** - Add/edit products and variants
3. **Process Orders** - Update order statuses
4. **View Analytics** - Monitor sales and performance

### **Test Accounts**
```
User Account:
Email: test@user.com
Password: test123

Admin Account:
Email: admin@nextbuy.com
Password: admin123
```

### **Test Payment**
Use Stripe test card: `4242 4242 4242 4242`

## 🧪 Testing

Run the comprehensive test suite:
```bash
node test-scenarios.js
```

This tests:
- ✅ Authentication system
- ✅ Product API endpoints
- ✅ Cart functionality
- ✅ Wishlist operations
- ✅ Order management
- ✅ Payment integration
- ✅ Admin features

## 📊 API Endpoints

### **Authentication**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /profile` - Get user profile

### **Products**
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `GET /products/:id/variants` - Get product variants

### **Cart**
- `GET /cart` - Get user cart
- `POST /cart/add` - Add item to cart
- `POST /cart/update` - Update cart item
- `DELETE /cart/remove/:variantId` - Remove from cart

### **Orders**
- `POST /orders` - Create new order
- `GET /orders/my` - Get user orders
- `PUT /orders/:id/cancel` - Cancel order

### **Admin**
- `GET /admin/dashboard` - Admin analytics
- `GET /admin/orders` - All orders
- `PUT /admin/orders/:id` - Update order status

## 🌟 Key Achievements

- **Full-Stack Implementation** - Complete e-commerce solution from database to UI
- **Modern Architecture** - Clean separation of concerns with TypeScript
- **Production Ready** - Comprehensive error handling and validation
- **Scalable Design** - Modular structure supporting future enhancements
- **Security First** - JWT authentication, input validation, and secure payments
- **User Experience** - Intuitive interface with smooth interactions

## 🚀 Deployment

The application is deployment-ready with:
- **Docker containerization**
- **Railway cloud deployment**
- **Environment-based configuration**
- **Production optimizations**

## 📈 Future Enhancements

- [ ] Search and filtering functionality
- [ ] Product reviews and ratings
- [ ] Inventory management alerts
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Mobile app development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by [Dimitris Dogiamas]**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/yourprofile)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-green)](https://yourportfolio.com)
[![Email](https://img.shields.io/badge/Email-Contact-red)](mailto:your.email@example.com)
