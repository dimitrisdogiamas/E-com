# Stock Management System

## Overview
Το νέο Stock Management System διασφαλίζει ότι το απόθεμα των προϊόντων διαχειρίζεται σωστά κατά τη δημιουργία και ακύρωση παραγγελιών.

## Βασικά Χαρακτηριστικά

### ✅ Transaction-based Operations
Όλες οι stock operations γίνονται μέσα σε database transactions για data consistency:

```typescript
// Array-based transaction pattern
await this.prisma.$transaction([
  this.prisma.order.create({ data: { ... } }),
  this.prisma.productVariant.update({ 
    where: { id: variantId }, 
    data: { stock: { decrement: quantity } } 
  }),
  // ... other operations
]);
```

### ✅ Stock Validation
Πριν τη δημιουργία παραγγελίας, ελέγχεται η διαθεσιμότητα:

```typescript
// Validation before order creation
await this.validateStockAvailability(items);
```

### ✅ Automatic Restocking
Κατά την ακύρωση παραγγελίας, το stock επαναφέρεται αυτόματα:

```typescript
// Restock on cancellation
if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
  await this.restockOrderItems(currentOrder.items);
}
```

## API Endpoints

### 1. Create Order (Enhanced)
```
POST /orders
```
- ✅ Validates stock availability
- ✅ Creates order and decrements stock atomically
- ✅ Returns detailed error messages for insufficient stock

### 2. Update Order Status (Enhanced) 
```
PATCH /orders/:id/status
```
- ✅ Automatically restocks items when cancelling orders
- ✅ Prevents double-restocking

### 3. Check Stock (New)
```
GET /orders/check-stock/:variantId
```
Response:
```json
{
  "variantId": "variant-uuid",
  "stock": 25,
  "sku": "PRODUCT-M-BLACK",
  "productName": "Cotton T-Shirt"
}
```

## Error Handling

### Insufficient Stock
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for Cotton T-Shirt (TSHIRT-M-BLACK). Available: 5, Requested: 10"
}
```

### Variant Not Found
```json
{
  "statusCode": 400,
  "message": "One or more product variants not found"
}
```

## Database Changes

### Stock Field
```sql
-- ProductVariant table includes stock field
stock INT NOT NULL DEFAULT 0
```

### Atomic Updates
```sql
-- Decrement stock
UPDATE ProductVariant 
SET stock = stock - quantity 
WHERE id = variant_id;

-- Increment stock (restock)
UPDATE ProductVariant 
SET stock = stock + quantity 
WHERE id = variant_id;
```

## Testing

### Test Script
Χρησιμοποιήστε το `test-stock-management.js` για να δοκιμάσετε:

1. **Initial stock check**
2. **Order creation with stock decrement**
3. **Stock verification after order**
4. **Order cancellation with restock**
5. **Final stock verification**
6. **Insufficient stock error handling**

```bash
# Setup test configuration
# Edit TEST_CONFIG in test-stock-management.js
node test-stock-management.js
```

## Implementation Details

### Service Methods

#### `validateStockAvailability(items)`
- Ελέγχει stock για όλα τα items
- Throws error εάν δεν υπάρχει αρκετό stock
- Επιστρέφει stock summary

#### `createOrder(createOrderDto, userId)`
- Validates stock πρώτα
- Δημιουργεί order και κάνει decrement stock atomically  
- Enhanced error handling

#### `restockOrderItems(orderItems)`
- Increment stock για cancelled orders
- Transaction-based για consistency

#### `checkVariantStock(variantId)`
- Utility method για stock checking
- Επιστρέφει detailed stock information

### Logging
Όλες οι stock operations καταγράφονται:

```
🔍 Validating stock availability for order items
✅ Stock validation passed for 3 items
✅ Order NB202501150001 created successfully with stock updates
🔄 Restocked items for cancelled order
```

## Race Condition Protection

Το transaction pattern προστατεύει από:
- **Double booking** - Δύο users δεν μπορούν να αγοράσουν το τελευταίο item
- **Inconsistent state** - Order creation και stock update γίνονται atomically
- **Lost updates** - Database-level locking

## Best Practices

### 1. Always Use Transactions
```typescript
// ✅ Good
await this.prisma.$transaction([
  orderCreate,
  stockUpdate1,
  stockUpdate2
]);

// ❌ Bad  
await this.prisma.order.create(data);
await this.prisma.productVariant.update(stockData);
```

### 2. Validate Before Transaction
```typescript
// ✅ Good - validate first
await this.validateStockAvailability(items);
await this.prisma.$transaction(operations);

// ❌ Bad - validate inside transaction (slower)
await this.prisma.$transaction(async (prisma) => {
  // validation inside transaction
});
```

### 3. Handle Specific Errors
```typescript
// ✅ Good - specific error handling
if (error.message.includes('Insufficient stock')) {
  throw new BadRequestException(error.message);
}

// ❌ Bad - generic error
throw new BadRequestException('Order failed');
```

## Future Enhancements

### Low Stock Alerts
- Email notifications όταν stock < threshold
- Admin dashboard για inventory management

### Stock Reservations
- Temporary stock holds για active carts
- Timeout-based release mechanism

### Inventory Reports
- Stock movement tracking
- Sales analytics με stock correlation

## Configuration

### Environment Variables
```env
# Stock management settings
STOCK_CHECK_ENABLED=true
LOW_STOCK_THRESHOLD=10
STOCK_RESERVATION_TIMEOUT=900000  # 15 minutes
```

### Feature Flags
```typescript
// In order.service.ts
const ENABLE_STOCK_VALIDATION = process.env.STOCK_CHECK_ENABLED === 'true';
``` 