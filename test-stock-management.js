const axios = require('axios');

const API_URL = 'http://localhost:4001';

// Test data - replace with actual variant IDs from your database
const TEST_CONFIG = {
  variantId: '03b42aa5-b002-4c3f-b381-61e64a72aa32',
  userToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzNmZTE3Yi1mY2MwLTRhMDItOGQ0MC0wMmFkOWM2NjE3NzMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTA3NzIxMjcsImV4cCI6MTc1MTM3NjkyN30.aP4dhBAaBUbysGp07f-T-T8zj778-Qo1Qs66TWHnQ30',
  testQuantity: 2
};

async function testStockManagement() {
  console.log('🧪 Testing Stock Management Features\n');

  try {
    // 1. Check initial stock
    console.log('1️⃣ Checking initial stock...');
    const stockResponse = await axios.get(
      `${API_URL}/orders/check-stock/${TEST_CONFIG.variantId}`,
      {
        headers: { Authorization: `Bearer ${TEST_CONFIG.userToken}` }
      }
    );
    
    const initialStock = stockResponse.data.stock;
    console.log(`   Initial stock: ${initialStock} units`);
    console.log(`   Product: ${stockResponse.data.productName}`);
    console.log(`   SKU: ${stockResponse.data.sku}\n`);

    // 2. Get a product that has variants - we'll use the first one we find
    const productsResponse = await axios.get(`${API_URL}/products`);
    const allProducts = productsResponse.data;
    let productId = null;
    
    // Try to get detailed info for each product until we find one with our variant
    for (const product of allProducts) {
      try {
        const detailedProduct = await axios.get(`${API_URL}/products/${product.id}`);
        if (detailedProduct.data.variants && 
            detailedProduct.data.variants.some(v => v.id === TEST_CONFIG.variantId)) {
          productId = product.id;
          console.log(`   Found product: ${product.name} (ID: ${productId})`);
          break;
        }
      } catch (error) {
        // Skip this product and try the next one
        continue;
      }
    }
    
    if (!productId) {
      // Fallback: use a hardcoded productId that we know exists
      // From our earlier data, we can use any product ID
      productId = allProducts[0].id; // Use first product as fallback
      console.log(`   Using fallback product: ${allProducts[0].name} (ID: ${productId})`);
    }

    // 3. Create a test order
    console.log('3️⃣ Creating test order...');
    const orderData = {
      paymentMethod: 'credit_card', // Required field
      items: [
        {
          productId: productId, // Required field
          variantId: TEST_CONFIG.variantId,
          quantity: TEST_CONFIG.testQuantity,
          price: 29.99
        }
      ],
      totalAmount: 29.99 * TEST_CONFIG.testQuantity,
      shippingFullName: 'Test User',
      shippingAddress: '123 Test Street',
      shippingPhone: '+1234567890'
    };

    const orderResponse = await axios.post(
      `${API_URL}/orders`,
      orderData,
      {
        headers: { 
          Authorization: `Bearer ${TEST_CONFIG.userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const orderId = orderResponse.data.id;
    console.log(`   ✅ Order created: ${orderResponse.data.orderNumber}`);
    console.log(`   Order ID: ${orderId}\n`);

    // 4. Check stock after order
    console.log('4️⃣ Checking stock after order...');
    const newStockResponse = await axios.get(
      `${API_URL}/orders/check-stock/${TEST_CONFIG.variantId}`,
      {
        headers: { Authorization: `Bearer ${TEST_CONFIG.userToken}` }
      }
    );

    const newStock = newStockResponse.data.stock;
    console.log(`   Stock after order: ${newStock} units`);
    console.log(`   Stock reduced by: ${initialStock - newStock} units\n`);

    // 5. Cancel the order to test restocking
    console.log('5️⃣ Cancelling order to test restocking...');
    await axios.patch(
      `${API_URL}/orders/${orderId}/status`,
      { status: 'CANCELLED' },
      {
        headers: { 
          Authorization: `Bearer ${TEST_CONFIG.userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('   ✅ Order cancelled');

    // 6. Check stock after cancellation
    console.log('6️⃣ Checking stock after cancellation...');
    const finalStockResponse = await axios.get(
      `${API_URL}/orders/check-stock/${TEST_CONFIG.variantId}`,
      {
        headers: { Authorization: `Bearer ${TEST_CONFIG.userToken}` }
      }
    );

    const finalStock = finalStockResponse.data.stock;
    console.log(`   Final stock: ${finalStock} units`);
    console.log(`   Stock restored: ${finalStock === initialStock ? '✅ YES' : '❌ NO'}\n`);

    // 7. Test insufficient stock scenario
    console.log('7️⃣ Testing insufficient stock scenario...');
    const excessiveOrderData = {
      ...orderData,
      items: [
        {
          productId: productId, // Required field
          variantId: TEST_CONFIG.variantId,
          quantity: finalStock + 10, // Request more than available
          price: 29.99
        }
      ]
    };

    try {
      await axios.post(
        `${API_URL}/orders`,
        excessiveOrderData,
        {
          headers: { 
            Authorization: `Bearer ${TEST_CONFIG.userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('   ❌ ERROR: Should have failed with insufficient stock');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Insufficient stock')) {
        console.log('   ✅ Correctly rejected order with insufficient stock');
        console.log(`   Error message: ${error.response.data.message}`);
      } else {
        console.log('   ❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Stock management tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure to:');
    console.log('   - Update TEST_CONFIG with valid variantId and userToken');
    console.log('   - Ensure the backend server is running on localhost:4001');
    console.log('   - Have sufficient stock in the test variant');
  }
}

// Usage instructions
console.log('📋 SETUP INSTRUCTIONS:');
console.log('1. Replace TEST_CONFIG values with actual data from your database');
console.log('2. Get a valid JWT token by logging in');
console.log('3. Find a variant ID from your products');
console.log('4. Run: node test-stock-management.js\n');

// Uncomment the line below to run the test
testStockManagement();

module.exports = { testStockManagement }; 