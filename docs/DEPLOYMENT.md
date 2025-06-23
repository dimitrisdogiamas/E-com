# 🚀 NextBuy Deployment Guide

## Overview

This guide covers deployment strategies for the NextBuy e-commerce platform, including both backend (NestJS) and frontend (Next.js) components across various cloud platforms.

## 🏗️ Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Next.js)     │    │   (NestJS)      │    │    (MySQL)      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Vercel        │◄──►│ • Railway       │◄──►│ • PlanetScale   │
│ • Netlify       │    │ • Heroku        │    │ • Railway MySQL │
│ • AWS Amplify   │    │ • AWS ECS       │    │ • AWS RDS       │
│ • Cloudflare    │    │ • Google Cloud  │    │ • Google Cloud  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Quick Deploy (Recommended)

### Frontend: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd front-end/nextbuy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Backend: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway new
railway add
railway up
```

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Database hosted and accessible
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] Domain names configured
- [ ] Third-party API keys obtained (Stripe, Google OAuth)

### Code Preparation
- [ ] All tests passing
- [ ] Production build successful
- [ ] Database migrations applied
- [ ] Seed data prepared
- [ ] Security configurations verified

### Performance
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] CDN configured
- [ ] Caching strategies implemented

## 🗄️ Database Deployment

### Option 1: PlanetScale (Recommended)
```bash
# Install PlanetScale CLI
brew install planetscale/tap/pscale

# Create database
pscale database create nextbuy

# Create branch
pscale branch create nextbuy main

# Connect and migrate
pscale connect nextbuy main --port 3309
npx prisma db push
npm run seed
```

**Connection String:**
```env
DATABASE_URL="mysql://username:password@host:port/nextbuy?sslaccept=strict"
```

### Option 2: Railway MySQL
```bash
# Add MySQL service
railway add mysql

# Get connection string
railway variables
```

### Option 3: AWS RDS
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier nextbuy-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

## 🔧 Backend Deployment

### Railway Deployment

#### 1. Prepare Railway Configuration
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "backend"
source = "."

[services.variables]
NODE_ENV = "production"
PORT = "4001"
```

#### 2. Deploy Steps
```bash
# Initialize Railway project
railway new nextbuy-backend

# Link to repository
railway link

# Add environment variables
railway variables set DATABASE_URL="mysql://..."
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set GOOGLE_CLIENT_ID="your-google-client-id"
railway variables set GOOGLE_CLIENT_SECRET="your-google-secret"

# Deploy
railway up
```

#### 3. Post-Deployment
```bash
# Run database migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run seed

# Check deployment
railway logs
```

### Heroku Deployment

#### 1. Heroku Configuration
```json
// package.json
{
  "scripts": {
    "heroku-postbuild": "npx prisma generate && npm run build"
  },
  "engines": {
    "node": "20.x",
    "npm": "9.x"
  }
}
```

#### 2. Deploy to Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create nextbuy-backend

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set STRIPE_SECRET_KEY="sk_live_..."

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
heroku run npm run seed
```

### AWS ECS Deployment

#### 1. Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/ || exit 1

# Start command
CMD ["npm", "run", "start:prod"]
```

#### 2. ECS Task Definition
```json
{
  "family": "nextbuy-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "nextbuy-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/nextbuy-backend:latest",
      "portMappings": [
        {
          "containerPort": 4001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nextbuy-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🎨 Frontend Deployment

### Vercel Deployment

#### 1. Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd front-end/nextbuy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production

# Set custom domain
vercel domains add nextbuy.com
```

### Netlify Deployment

#### 1. Netlify Configuration
```toml
# netlify.toml
[build]
  base = "front-end/nextbuy"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.railway.app/:splat"
  status = 200
```

#### 2. Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify init
netlify deploy --prod
```

### AWS Amplify Deployment

#### 1. Amplify Configuration
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd front-end/nextbuy
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: front-end/nextbuy/.next
    files:
      - '**/*'
  cache:
    paths:
      - front-end/nextbuy/node_modules/**/*
```

## 🔐 Environment Variables

### Backend Environment Variables
```env
# Production .env
NODE_ENV=production
PORT=4001

# Database
DATABASE_URL="mysql://username:password@host:port/nextbuy?sslaccept=strict"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="https://your-backend-domain.com/auth/google/callback"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"

# CORS
FRONTEND_URL="https://your-frontend-domain.com"

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/gif"
```

### Frontend Environment Variables
```env
# Production .env.local
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🌐 Domain & SSL Configuration

### Custom Domain Setup
```bash
# Vercel
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com

# Railway
railway domains add yourdomain.com

# Cloudflare DNS (recommended)
# Add A record: @ -> Vercel IP
# Add CNAME: www -> yourdomain.com
# Add CNAME: api -> railway-backend-url
```

### SSL Certificate
Most platforms provide automatic SSL certificates:
- **Vercel**: Automatic SSL with Let's Encrypt
- **Railway**: Automatic SSL for custom domains
- **Netlify**: Automatic SSL with Let's Encrypt
- **AWS**: Certificate Manager integration

## 📊 Monitoring & Logging

### Application Monitoring
```javascript
// utils/monitoring.ts
export const trackDeployment = () => {
  console.log('🚀 Application deployed successfully');
  console.log('📊 Environment:', process.env.NODE_ENV);
  console.log('🔗 Database connected:', !!process.env.DATABASE_URL);
  console.log('🔐 JWT configured:', !!process.env.JWT_SECRET);
  console.log('💳 Stripe configured:', !!process.env.STRIPE_SECRET_KEY);
};
```

### Health Checks
```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    };
  }

  @Get('db')
  async databaseCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected' };
    } catch (error) {
      return { status: 'unhealthy', database: 'disconnected', error };
    }
  }
}
```

### Logging Configuration
```typescript
// logger.config.ts
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ],
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railway/cli@latest
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway up --service backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: front-end/nextbuy
```

## 🛡️ Security Considerations

### Production Security Checklist
- [ ] HTTPS enforced on all domains
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] SQL injection protection active
- [ ] XSS protection enabled
- [ ] CSRF protection implemented

### Security Headers
```typescript
// main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📈 Performance Optimization

### Backend Optimization
```typescript
// Performance configurations
app.use(compression()); // Gzip compression
app.use(express.json({ limit: '10mb' })); // Request size limiting

// Database connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20000'
    }
  }
});
```

### Frontend Optimization
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
    modern: true,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Backend Issues
```bash
# Check logs
railway logs
heroku logs --tail

# Database connection issues
railway run npx prisma db push
railway run npx prisma migrate deploy

# Environment variable issues
railway variables
heroku config
```

#### Frontend Issues
```bash
# Build failures
vercel logs
netlify logs

# Environment variables
vercel env ls
netlify env:list

# Clear cache
vercel --clean
npm run build
```

### Health Check Commands
```bash
# Backend health check
curl https://your-backend-domain.com/health

# Database connectivity
curl https://your-backend-domain.com/health/db

# Frontend accessibility
curl -I https://your-frontend-domain.com
```

## 📊 Performance Monitoring

### Metrics to Monitor
- Response time
- Error rates
- Database query performance
- Memory usage
- CPU utilization
- Active user connections

### Monitoring Tools
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **LogRocket**: Frontend monitoring
- **Google Analytics**: User behavior

## 🔄 Backup & Recovery

### Database Backup
```bash
# Automated daily backups
mysqldump -h host -u user -p database > backup_$(date +%Y%m%d).sql

# AWS S3 backup storage
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

### Application Backup
```bash
# Code repository backup (Git)
git push --mirror https://github.com/backup-repo/nextbuy.git

# Environment variables backup
railway variables > env-backup.txt
vercel env pull .env.backup
```

---

**🎉 Your NextBuy application is now ready for production deployment!**

For support and questions:
- Check application logs for specific errors
- Review platform documentation
- Contact the development team
- Create issues in the repository 