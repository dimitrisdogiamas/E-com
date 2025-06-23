# ❓ NextBuy FAQ (Frequently Asked Questions)

## 🚀 Getting Started

### Q: What is NextBuy?
**A:** NextBuy is a modern, full-stack e-commerce platform built with NestJS (backend) and Next.js (frontend). It features product management, shopping cart, real-time chat, payment processing, and comprehensive admin functionality.

### Q: What technologies does NextBuy use?
**A:** 
- **Backend**: NestJS, TypeScript, Prisma ORM, MySQL
- **Frontend**: Next.js 14, React 18, Material-UI, TypeScript
- **Real-time**: Socket.io WebSockets
- **Payments**: Stripe integration
- **Authentication**: JWT + Google OAuth
- **Database**: MySQL with Prisma ORM

### Q: Is NextBuy production-ready?
**A:** Yes! NextBuy includes:
- ✅ Comprehensive testing (7/7 systems passing)
- ✅ Security features (JWT, bcrypt, input validation)
- ✅ Deployment guides for multiple platforms
- ✅ Performance optimizations
- ✅ Error handling and logging

## 🛠️ Installation & Setup

### Q: What are the system requirements?
**A:** 
- Node.js 20+ and npm 9+
- MySQL database
- Stripe account (for payments)
- Google OAuth credentials (optional)

### Q: How do I set up the development environment?
**A:** Follow these steps:

1. **Backend Setup:**
```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma migrate dev
npm run seed
npm run start:dev
```

2. **Frontend Setup:**
```bash
cd front-end/nextbuy
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### Q: What environment variables do I need?
**A:** Check the [Environment Variables section in the main README](../README.md#environment-variables) for complete lists for both backend and frontend.

### Q: How do I seed the database with test data?
**A:** Run `npm run seed` in the backend directory. This creates:
- Admin user (admin@nextbuy.com / admin123)
- Test user (test@user.com / test123)
- 30+ products across multiple categories
- Product variants with sizes and colors
- Sample reviews

## 🔧 Development

### Q: How do I run tests?
**A:** 
```bash
# Backend comprehensive tests
node test-scenarios.js

# Individual feature debugging
node debug-fixes.js

# Frontend tests
cd front-end/nextbuy
npm test
```

### Q: The server won't start - "EADDRINUSE" error. What do I do?
**A:** This means port 4001 is already in use. Either:
1. Kill the existing process: `pkill -f "node.*4001"`
2. Change the port in your `.env` file: `PORT=4002`

### Q: How do I add new products?
**A:** You can:
1. Use the admin interface at `/admin/products` (login as admin)
2. Use the API directly: `POST /products` (requires admin token)
3. Add them to the seed script in `prisma/seed.ts`

### Q: How do I customize the frontend theme?
**A:** Edit the Material-UI theme in the frontend theme configuration. The app supports light/dark mode toggle.

## 🔐 Authentication

### Q: What are the default user accounts?
**A:** After seeding:
- **Admin**: admin@nextbuy.com / admin123
- **Test User**: test@user.com / test123

### Q: How does Google OAuth work?
**A:** 
1. Configure Google OAuth credentials in your `.env`
2. Users click "Sign in with Google"
3. They're redirected to Google for authentication
4. Google redirects back with user info
5. NextBuy creates/logs in the user automatically

### Q: How long do JWT tokens last?
**A:** By default, 7 days. You can change this in `JWT_EXPIRES_IN` environment variable.

### Q: Can I add other OAuth providers?
**A:** Yes! The authentication system is extensible. You can add Facebook, GitHub, etc. by following the NestJS Passport documentation.

## 💳 Payments

### Q: How do I set up Stripe?
**A:** 
1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Add them to your environment variables:
   - Backend: `STRIPE_SECRET_KEY`
   - Frontend: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Q: Can I test payments without real money?
**A:** Yes! Use Stripe's test mode with test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Q: How do I add other payment methods?
**A:** Stripe supports many payment methods. You can extend the payment component to include:
- Apple Pay
- Google Pay
- Bank transfers
- Buy now, pay later options

## 💬 Chat System

### Q: How does the real-time chat work?
**A:** NextBuy uses Socket.io WebSockets with JWT authentication:
1. Users connect with their JWT token
2. Server verifies the token and authenticates the connection
3. Users can join rooms and send messages
4. Messages are broadcast to all users in the room

### Q: Why does chat show "disconnected"?
**A:** This usually means:
1. Backend server is not running
2. WebSocket authentication failed
3. Network connectivity issues

Check the browser console for error messages.

### Q: Can I add private messaging?
**A:** Yes! The chat system supports rooms. You can create private rooms for 1-on-1 messaging.

## 🛒 E-commerce Features

### Q: How do product variants work?
**A:** Products can have multiple variants based on:
- **Size**: XS, S, M, L, XL, XXL
- **Color**: With hex codes for display
- **Price**: Can vary per variant
- **Stock**: Individual inventory tracking

### Q: How is cart data stored?
**A:** 
- **Logged-in users**: Cart is saved to the database
- **Guest users**: Cart is stored in local storage
- Cart persists across sessions for logged-in users

### Q: How do I add new product categories?
**A:** Categories are stored as strings in the Product table. You can:
1. Add new categories when creating products
2. Update the frontend filters to include new categories

### Q: How are orders processed?
**A:** Order flow:
1. User adds items to cart
2. Proceeds to checkout
3. Enters payment information
4. Stripe processes payment
5. Order is created with "PENDING" status
6. Admin can update status (PROCESSING → SHIPPED → DELIVERED)

## 🎨 Frontend

### Q: How many pages does the frontend have?
**A:** 21 comprehensive pages covering:
- E-commerce: Home, Products, Cart, Checkout, Orders, Wishlist
- User: Profile, Auth, Chat
- Admin: Dashboard, User/Product/Order management
- Utility: Search, About, Contact, Privacy, Terms

### Q: Can I customize the UI components?
**A:** Yes! NextBuy uses Material-UI components that can be fully customized through:
1. Theme configuration
2. Component-level styling
3. Custom CSS/styled-components

### Q: How do I add new pages?
**A:** NextBuy uses Next.js App Router:
1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. The route is automatically available

### Q: Is the frontend mobile-responsive?
**A:** Yes! All pages are fully responsive using Material-UI's grid system and breakpoints.

## 🗄️ Database

### Q: Can I use a different database?
**A:** Currently optimized for MySQL, but Prisma supports:
- PostgreSQL
- SQLite
- MongoDB
- SQL Server

You'd need to update the Prisma schema and connection string.

### Q: How do I backup the database?
**A:** 
```bash
# MySQL backup
mysqldump -u username -p nextbuy > backup.sql

# Restore
mysql -u username -p nextbuy < backup.sql
```

### Q: How do I view the database?
**A:** 
```bash
# Prisma Studio (GUI)
npx prisma studio

# Command line
mysql -u username -p nextbuy
```

### Q: How do I add new database fields?
**A:** 
1. Update the Prisma schema in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Update your TypeScript types and API endpoints

## 🚀 Deployment

### Q: Where can I deploy NextBuy?
**A:** Recommended stack:
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Railway (Node.js hosting)
- **Database**: PlanetScale (MySQL)

Alternative platforms: Netlify, Heroku, AWS, Google Cloud

### Q: How do I deploy to production?
**A:** Follow the comprehensive [Deployment Guide](./DEPLOYMENT.md) which covers:
- Environment setup
- Platform-specific instructions
- SSL certificates
- Domain configuration
- CI/CD pipelines

### Q: Do I need to change anything for production?
**A:** 
1. Update environment variables for production
2. Use production Stripe keys
3. Configure proper CORS settings
4. Set up SSL certificates
5. Configure production database

## 🛡️ Security

### Q: Is NextBuy secure?
**A:** Yes! Security features include:
- JWT authentication with secure secrets
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- Rate limiting

### Q: How do I secure my production deployment?
**A:** 
1. Use HTTPS everywhere
2. Set strong JWT secrets (32+ characters)
3. Configure proper CORS origins
4. Enable rate limiting
5. Use production database with restricted access
6. Keep dependencies updated

### Q: How are passwords stored?
**A:** Passwords are hashed using bcrypt with salt rounds before storage. Plain text passwords are never stored.

## 🔍 Troubleshooting

### Q: Tests are failing. What should I check?
**A:** 
1. Ensure backend server is running on port 4001
2. Database is accessible and seeded
3. Environment variables are correct
4. Run `node test-scenarios.js` for comprehensive system tests

### Q: Frontend won't build. What's wrong?
**A:** Common issues:
1. Node.js version mismatch (need 20+)
2. Missing environment variables
3. TypeScript errors
4. Dependency conflicts

Run `npm run build` to see specific error messages.

### Q: WebSocket connection fails. How to fix?
**A:** Check:
1. Backend server is running
2. JWT token is valid
3. CORS is configured correctly
4. Firewall/proxy isn't blocking WebSocket connections

### Q: Database connection errors?
**A:** Verify:
1. MySQL server is running
2. Database exists and is accessible
3. Connection string in `DATABASE_URL` is correct
4. User has proper permissions

### Q: Stripe payments not working?
**A:** Check:
1. Stripe keys are correct (test vs production)
2. Webhook endpoints are configured
3. Currency settings match your account
4. Test with Stripe's test card numbers

## 📊 Performance

### Q: How can I optimize performance?
**A:** NextBuy includes several optimizations:
- Database indexing for common queries
- Image optimization with Next.js
- Code splitting for large components
- CDN recommendations for static assets
- Connection pooling for database

### Q: How do I monitor application performance?
**A:** Recommended tools:
- Backend: New Relic, DataDog
- Frontend: LogRocket, Sentry
- Database: Built-in MySQL monitoring
- Users: Google Analytics

## 🤝 Contributing

### Q: How can I contribute to NextBuy?
**A:** 
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Follow coding standards (ESLint, Prettier)
5. Submit a pull request

### Q: What coding standards should I follow?
**A:** 
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Use conventional commit messages
- Document complex components

### Q: How do I report bugs?
**A:** 
1. Check existing issues first
2. Create a new GitHub issue
3. Include reproduction steps
4. Provide error logs
5. Specify your environment details

## 📞 Getting Help

### Q: Where can I get help?
**A:** 
1. Check this FAQ first
2. Read the relevant documentation files
3. Run test scenarios to identify issues
4. Check application logs
5. Create a GitHub issue
6. Contact the development team

### Q: How do I get support for deployment issues?
**A:** 
1. Check the [Deployment Guide](./DEPLOYMENT.md)
2. Review platform-specific documentation
3. Check application logs
4. Verify environment variables
5. Test with health check endpoints

---

**🎉 Still have questions? Check the [documentation index](./INDEX.md) or create a GitHub issue!** 