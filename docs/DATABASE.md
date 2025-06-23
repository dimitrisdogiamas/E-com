# 🗄️ NextBuy Database Documentation

## Overview

NextBuy uses **Prisma ORM** with **MySQL** database to manage all application data. The database schema is designed for a full-featured e-commerce platform with user management, product catalog, shopping cart, orders, and real-time chat.

## 🏗️ Database Schema

### Core Tables

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Product   │    │    Order    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │◄──┐│ name        │    │ userId (FK) │
│ name        │   ││ description │    │ total       │
│ password    │   ││ price       │    │ status      │
│ role        │   ││ category    │    │ createdAt   │
│ createdAt   │   │└─────────────┘    └─────────────┘
└─────────────┘   │
                  │ ┌─────────────┐    ┌─────────────┐
                  │ │  CartItem   │    │ WishlistItem│
                  │ ├─────────────┤    ├─────────────┤
                  │ │ id (PK)     │    │ id (PK)     │
                  └─┤ userId (FK) │    │ userId (FK) │
                    │ variantId   │    │ productId   │
                    │ quantity    │    │ createdAt   │
                    └─────────────┘    └─────────────┘
```

## 📋 Table Definitions

### User Table
Stores user authentication and profile information.

```sql
CREATE TABLE User (
  id          VARCHAR(191) NOT NULL PRIMARY KEY,
  email       VARCHAR(191) NOT NULL UNIQUE,
  name        VARCHAR(191) NOT NULL,
  password    VARCHAR(191),          -- NULL for OAuth users
  role        ENUM('USER', 'ADMIN') DEFAULT 'USER',
  googleId    VARCHAR(191),          -- For Google OAuth
  createdAt   DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt   DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);
```

**Fields:**
- `id`: UUID primary key
- `email`: Unique email address
- `name`: User's full name
- `password`: Hashed password (bcrypt)
- `role`: User role (USER/ADMIN)
- `googleId`: Google OAuth identifier
- `createdAt/updatedAt`: Timestamps

### Product Table
Main product catalog with categories and descriptions.

```sql
CREATE TABLE Product (
  id          VARCHAR(191) NOT NULL PRIMARY KEY,
  name        VARCHAR(191) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  category    VARCHAR(191) NOT NULL,
  createdAt   DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt   DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);
```

**Fields:**
- `id`: UUID primary key
- `name`: Product name
- `description`: Detailed product description
- `price`: Base price in decimal format
- `category`: Product category (T-Shirts, Bottoms, etc.)

### ProductVariant Table
Product variations with size, color, and stock management.

```sql
CREATE TABLE ProductVariant (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  sku       VARCHAR(191) NOT NULL UNIQUE,
  productId VARCHAR(191) NOT NULL,
  sizeId    VARCHAR(191) NOT NULL,
  colorId   VARCHAR(191) NOT NULL,
  price     DECIMAL(10,2) NOT NULL,
  stock     INT NOT NULL DEFAULT 0,
  
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (sizeId) REFERENCES Size(id),
  FOREIGN KEY (colorId) REFERENCES Color(id)
);
```

**Fields:**
- `sku`: Stock Keeping Unit (unique identifier)
- `productId`: Reference to parent product
- `sizeId`: Reference to size
- `colorId`: Reference to color
- `price`: Variant-specific price
- `stock`: Available inventory

### Size & Color Tables
Reference tables for product variants.

```sql
CREATE TABLE Size (
  id   VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE
);

CREATE TABLE Color (
  id      VARCHAR(191) NOT NULL PRIMARY KEY,
  name    VARCHAR(191) NOT NULL UNIQUE,
  hexCode VARCHAR(7) NOT NULL  -- #FFFFFF format
);
```

### ProductImage Table
Product image management with URL storage.

```sql
CREATE TABLE ProductImage (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  url       VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
);
```

### CartItem Table
Shopping cart with user-specific items.

```sql
CREATE TABLE CartItem (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  userId    VARCHAR(191) NOT NULL,
  variantId VARCHAR(191) NOT NULL,
  quantity  INT NOT NULL DEFAULT 1,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (variantId) REFERENCES ProductVariant(id) ON DELETE CASCADE,
  UNIQUE(userId, variantId)
);
```

### WishListItem Table
User wishlists for saved products.

```sql
CREATE TABLE WishListItem (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  userId    VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  UNIQUE(userId, productId)
);
```

### Order Table
Order management with status tracking.

```sql
CREATE TABLE Order (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  userId    VARCHAR(191) NOT NULL,
  total     DECIMAL(10,2) NOT NULL,
  status    ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (userId) REFERENCES User(id)
);
```

### OrderItem Table
Individual items within orders.

```sql
CREATE TABLE OrderItem (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  orderId   VARCHAR(191) NOT NULL,
  variantId VARCHAR(191) NOT NULL,
  quantity  INT NOT NULL,
  price     DECIMAL(10,2) NOT NULL,  -- Price at time of order
  
  FOREIGN KEY (orderId) REFERENCES Order(id) ON DELETE CASCADE,
  FOREIGN KEY (variantId) REFERENCES ProductVariant(id)
);
```

### Review Table
Product reviews and ratings.

```sql
CREATE TABLE Review (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  userId    VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  rating    INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment   TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  UNIQUE(userId, productId)
);
```

### Message Table
Chat system messages.

```sql
CREATE TABLE Message (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  userId    VARCHAR(191) NOT NULL,
  room      VARCHAR(191) NOT NULL,
  message   TEXT NOT NULL,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

## 📊 Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String?
  role      Role     @default(USER)
  googleId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  cartItems     CartItem[]
  wishListItems WishListItem[]
  orders        Order[]
  reviews       Review[]
  messages      Message[]

  @@map("users")
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?  @db.Text
  price       Decimal  @db.Decimal(10, 2)
  category    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  variants      ProductVariant[]
  images        ProductImage[]
  wishListItems WishListItem[]
  reviews       Review[]

  @@map("products")
}

model ProductVariant {
  id        String  @id @default(uuid())
  sku       String  @unique
  productId String
  sizeId    String
  colorId   String
  price     Decimal @db.Decimal(10, 2)
  stock     Int     @default(0)

  // Relations
  product   Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  size      Size        @relation(fields: [sizeId], references: [id])
  color     Color       @relation(fields: [colorId], references: [id])
  cartItems CartItem[]
  orderItems OrderItem[]

  @@map("product_variants")
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## 🔍 Database Queries

### Common Query Patterns

#### User Authentication
```sql
-- Find user by email
SELECT * FROM User WHERE email = ?;

-- Create new user
INSERT INTO User (id, email, name, password, role) 
VALUES (?, ?, ?, ?, ?);
```

#### Product Catalog
```sql
-- Get products with variants and images
SELECT 
  p.*,
  GROUP_CONCAT(DISTINCT pi.url) as images,
  COUNT(DISTINCT pv.id) as variant_count
FROM Product p
LEFT JOIN ProductImage pi ON p.id = pi.productId
LEFT JOIN ProductVariant pv ON p.id = pv.productId
GROUP BY p.id
ORDER BY p.createdAt DESC;

-- Get product with full details
SELECT 
  p.*,
  pv.id as variant_id,
  pv.sku,
  pv.price as variant_price,
  pv.stock,
  s.name as size,
  c.name as color,
  c.hexCode
FROM Product p
JOIN ProductVariant pv ON p.id = pv.productId
JOIN Size s ON pv.sizeId = s.id
JOIN Color c ON pv.colorId = c.id
WHERE p.id = ?;
```

#### Shopping Cart
```sql
-- Get user cart with product details
SELECT 
  ci.id,
  ci.quantity,
  pv.price,
  p.name as product_name,
  s.name as size,
  c.name as color
FROM CartItem ci
JOIN ProductVariant pv ON ci.variantId = pv.id
JOIN Product p ON pv.productId = p.id
JOIN Size s ON pv.sizeId = s.id
JOIN Color c ON pv.colorId = c.id
WHERE ci.userId = ?;

-- Calculate cart total
SELECT SUM(ci.quantity * pv.price) as total
FROM CartItem ci
JOIN ProductVariant pv ON ci.variantId = pv.id
WHERE ci.userId = ?;
```

#### Order Processing
```sql
-- Create order from cart
INSERT INTO Order (id, userId, total, status)
VALUES (?, ?, ?, 'PENDING');

-- Move cart items to order
INSERT INTO OrderItem (id, orderId, variantId, quantity, price)
SELECT 
  UUID(),
  ? as orderId,
  ci.variantId,
  ci.quantity,
  pv.price
FROM CartItem ci
JOIN ProductVariant pv ON ci.variantId = pv.id
WHERE ci.userId = ?;

-- Clear cart after order
DELETE FROM CartItem WHERE userId = ?;
```

## 🗂️ Database Indexes

### Performance Indexes
```sql
-- User email lookup
CREATE INDEX idx_user_email ON User(email);

-- Product category filtering
CREATE INDEX idx_product_category ON Product(category);

-- Product variant SKU lookup
CREATE INDEX idx_variant_sku ON ProductVariant(sku);

-- Cart user lookup
CREATE INDEX idx_cart_user ON CartItem(userId);

-- Order user lookup
CREATE INDEX idx_order_user ON Order(userId);

-- Order status filtering
CREATE INDEX idx_order_status ON Order(status);

-- Review product lookup
CREATE INDEX idx_review_product ON Review(productId);

-- Message room lookup
CREATE INDEX idx_message_room ON Message(room);
```

## 🔄 Database Migrations

### Migration Commands
```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Example Migration
```sql
-- Add new column to Product table
ALTER TABLE Product ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- Create index for featured products
CREATE INDEX idx_product_featured ON Product(featured);
```

## 🌱 Database Seeding

### Seed Script Structure
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nextbuy.com' },
    update: {},
    create: {
      email: 'admin@nextbuy.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  // Create sizes
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  for (const sizeName of sizes) {
    await prisma.size.upsert({
      where: { name: sizeName },
      update: {},
      create: { name: sizeName },
    });
  }

  // Create colors
  const colors = [
    { name: 'Black', hexCode: '#000000' },
    { name: 'White', hexCode: '#FFFFFF' },
    { name: 'Blue', hexCode: '#0066CC' },
    // ... more colors
  ];

  for (const color of colors) {
    await prisma.color.upsert({
      where: { name: color.name },
      update: {},
      create: color,
    });
  }

  // Create products with variants
  const products = [
    {
      name: 'Classic White T-Shirt',
      description: 'Premium cotton t-shirt',
      price: 25.99,
      category: 'T-Shirts',
    },
    // ... more products
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Create variants for each product
    const createdSizes = await prisma.size.findMany();
    const createdColors = await prisma.color.findMany();

    for (const size of createdSizes.slice(0, 3)) {
      for (const color of createdColors.slice(0, 2)) {
        await prisma.productVariant.create({
          data: {
            sku: `${product.name.replace(/\s+/g, '').toUpperCase()}-${size.name}-${color.name.toUpperCase()}`,
            productId: product.id,
            sizeId: size.id,
            colorId: color.id,
            price: productData.price,
            stock: Math.floor(Math.random() * 100) + 10,
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running Seed
```bash
npm run seed
```

## 📊 Database Analytics

### Common Analytics Queries
```sql
-- User registration statistics
SELECT 
  DATE(createdAt) as date,
  COUNT(*) as new_users
FROM User 
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(createdAt)
ORDER BY date;

-- Product sales statistics
SELECT 
  p.name,
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as revenue
FROM OrderItem oi
JOIN ProductVariant pv ON oi.variantId = pv.id
JOIN Product p ON pv.productId = p.id
JOIN Order o ON oi.orderId = o.id
WHERE o.status = 'DELIVERED'
GROUP BY p.id
ORDER BY revenue DESC;

-- Cart abandonment analysis
SELECT 
  COUNT(DISTINCT ci.userId) as users_with_cart,
  COUNT(DISTINCT o.userId) as users_who_ordered
FROM CartItem ci
LEFT JOIN Order o ON ci.userId = o.userId 
  AND o.createdAt >= ci.createdAt;
```

## 🔒 Database Security

### Security Measures
1. **Password Hashing**: bcrypt with salt rounds
2. **SQL Injection Prevention**: Prisma ORM parameterized queries
3. **Connection Security**: SSL/TLS encryption
4. **Access Control**: Database user permissions
5. **Backup Strategy**: Regular automated backups

### Environment Variables
```env
# Database configuration
DATABASE_URL="mysql://username:password@localhost:3306/nextbuy?sslaccept=strict"

# Connection pooling
DATABASE_CONNECTION_LIMIT=10
DATABASE_POOL_TIMEOUT=20000
```

## 🚀 Performance Optimization

### Query Optimization
1. **Proper Indexing**: Strategic index creation
2. **Eager Loading**: Include related data in queries
3. **Pagination**: Limit large result sets
4. **Connection Pooling**: Efficient connection management
5. **Query Analysis**: Regular EXPLAIN analysis

### Prisma Optimization
```typescript
// Efficient queries with Prisma
const products = await prisma.product.findMany({
  include: {
    images: true,
    variants: {
      include: {
        size: true,
        color: true,
      },
    },
    reviews: {
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    },
  },
  take: 20, // Pagination
  skip: page * 20,
  orderBy: {
    createdAt: 'desc',
  },
});
```

## 🔧 Database Maintenance

### Regular Tasks
```bash
# Check database size
SELECT 
  table_schema as 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'nextbuy'
GROUP BY table_schema;

# Optimize tables
OPTIMIZE TABLE User, Product, ProductVariant, Order, OrderItem;

# Check for unused indexes
SELECT * FROM sys.schema_unused_indexes 
WHERE object_schema = 'nextbuy';
```

### Backup Strategy
```bash
# Daily backup
mysqldump -u username -p nextbuy > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u username -p nextbuy < backup_20241201.sql
``` 