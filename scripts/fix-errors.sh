#!/bin/bash

echo "🔧 NextBuy Error Fix Script"
echo "=========================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="mysql://root:12345@localhost:3306/nextbuy"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-for-nextbuy-development-use-random-256-bit-in-production"
JWT_EXPIRES_IN="7d"

# Stripe (Test Keys for Development)
STRIPE_SECRET_KEY="sk_test_51QfuHFJt8nUuAhJP7j8xllMCHAyDQJuKAPJgQ8XJYUhALx7w8DyefJNBQ3WFGHSfH9FydlUJf3bHJZWJlJmlmJlg00hXz8D8FG"
STRIPE_PUBLISHABLE_KEY="pk_test_51QfuHFJt8nUuAhJP7j8xllMCHAyDQJuKAPJgQ8XJYUhALx7w8DyefJNBQ3WFGHSfH9FydlUJf3bHJZWJlJmlmJlg00hXz8D8FG"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="test@example.com"
EMAIL_PASSWORD="test-password"
EMAIL_FROM="NextBuy <noreply@nextbuy.com>"

# App Configuration
NODE_ENV="development"
PORT=4001
FRONTEND_URL="http://localhost:3000"
EOF
    print_status ".env file created with test values"
else
    print_status ".env file exists"
fi

# 2. Install dependencies
print_status "Installing dependencies..."
npm install

# 3. Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# 4. Build the application
print_status "Building application..."
npm run build

if [ $? -eq 0 ]; then
    print_status "🎉 All fixes applied successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start the server: npm run start:dev"
    echo "2. Test payment endpoint: curl http://localhost:4001/payment/config"
    echo "3. Open frontend: cd front-end/nextbuy && npm run dev"
else
    print_error "Build failed. Check the errors above."
    exit 1
fi

# Δημιουργία νέου fresh token
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nextbuy.com","password":"admin123"}' 