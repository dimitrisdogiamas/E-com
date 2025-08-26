#!/bin/bash

echo "🎯 NextBuy Render Deployment Setup"
echo "=================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_status "Setting up Render deployment..."

# Step 1: Update Prisma schema for PostgreSQL
print_status "Updating database configuration for PostgreSQL..."

# Create backup of current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Update datasource to PostgreSQL
sed -i.bak 's/provider = "mysql"/provider = "postgresql"/g' prisma/schema.prisma

print_status "✅ Updated Prisma schema for PostgreSQL"

# Step 2: Create Render build script
print_status "Creating Render-optimized build script..."

cat > scripts/render-build.sh << 'EOF'
#!/bin/bash
echo "🔧 Render Build Process Starting..."

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build the application
npm run build

echo "✅ Render Build Process Complete!"
EOF

chmod +x scripts/render-build.sh

print_status "✅ Created Render build script"

# Step 3: Instructions
echo ""
print_status "🎯 Next Steps:"
echo "1. 🌐 Go to https://render.com and sign up"
echo "2. 📂 Connect your GitHub repository"
echo "3. 🗄️  Create a PostgreSQL database first"
echo "4. 🚀 Create a web service with these settings:"
echo "   - Build Command: ./scripts/render-build.sh"
echo "   - Start Command: npm run start:prod"
echo "   - Environment: Node.js"
echo "   - Plan: Free"
echo ""
echo "5. 🔧 Add environment variables:"
echo "   - DATABASE_URL (from your Render PostgreSQL)"
echo "   - JWT_SECRET (generate a secure key)"
echo "   - NODE_ENV=production"
echo "   - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
echo "   - STRIPE_SECRET_KEY"
echo ""
echo "6. 🎉 Deploy and test!"

print_warning "Note: Schema updated for PostgreSQL. MySQL backup saved as schema.prisma.backup"
