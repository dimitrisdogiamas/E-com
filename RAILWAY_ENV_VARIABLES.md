# 🚂 Railway Environment Variables

Αντίγραψε αυτές τις μεταβλητές στο **Railway Settings > Variables**:

## **Backend Environment Variables**

```bash
# Database (Railway θα δημιουργήσει MySQL αυτόματα)
DATABASE_URL=mysql://username:password@host:port/database

# JWT Configuration  
JWT_SECRET=nextbuy-super-secret-jwt-key-2024-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51QfuHFJt8nUuAhJP7j8xllMCHAyDQJuKAPJgQ8XJYUhALx7w8DyefJNBQ3WFGHSfH9FydlUJf3bHJZWJlJmlmJlg00h4yGO8nQ
STRIPE_PUBLISHABLE_KEY=pk_test_51QfuHFJt8nUuAhJP7j8xllMCHAyDQJuKAPJgQ8XJYUhALx7w8DyefJNBQ3WFGHSfH9FydlUJf3bHJZWJlJmlmJlg00hXz8D8FG

# Node Configuration
NODE_ENV=production
PORT=4001

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## **Frontend Environment Variables**

Μετά το backend deployment, θα πάρεις το URL και θα βάλεις:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51QfuHFJt8nUuAhJP7j8xllMCHAyDQJuKAPJgQ8XJYUhALx7w8DyefJNBQ3WFGHSfH9FydlUJf3bHJZWJlJmlmJlg00hXz8D8FG
```

## **Βήματα:**

1. **Backend Deploy:**
   - New Project → Deploy from GitHub
   - Επίλεξε το repository
   - Add τις environment variables από πάνω
   - Add MySQL database service

2. **Database Setup:**
   - Railway → Add MySQL
   - Κόπια το DATABASE_URL
   - Βάλε το στις environment variables

3. **Frontend Deploy:**
   - Μετά το backend deployment
   - New Project για το frontend folder
   - Set το NEXT_PUBLIC_API_URL με το backend URL 