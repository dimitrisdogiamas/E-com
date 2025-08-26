#!/bin/bash

echo "🚀 NextBuy Deployment Script"
echo "=========================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the backend root directory"
    exit 1
fi

print_status "Starting NextBuy deployment process..."

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm install --production

# Step 2: Build the application
print_status "Building application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

# Step 3: Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    print_error "Database migration failed!"
    exit 1
fi

# Step 4: Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Step 5: Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Step 6: Deploy to Railway
print_status "Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    print_status "🎉 Backend deployment successful!"
    echo ""
    print_status "Next steps:"
    echo "1. 🔧 Set up environment variables in Railway dashboard"
    echo "2. 🌐 Deploy frontend to Vercel"
    echo "3. 🧪 Test all functionality"
    echo "4. 🎯 Configure custom domain"
    
    # Frontend deployment instructions
    echo ""
    echo "Frontend Deployment Commands:"
    echo "cd front-end/nextbuy"
    echo "npm install"
    echo "vercel --prod"
else
    print_error "Deployment failed!"
    exit 1
fi 