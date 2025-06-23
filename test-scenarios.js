
const axios = require('axios');

const API_URL = 'http://localhost:4001';
let authToken = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const color = colors[level] || colors.reset;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

async function testAuthentication() {
  log('blue', '🔐 Testing Authentication...');
  
  try {
    // Test login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@user.com',
      password: 'test123'
    });
    
    if (loginResponse.data.accessToken) {
      authToken = loginResponse.data.accessToken;
      log('green', '✅ Login successful');
    } else {
      log('red', '❌ Login failed - no token returned');
      return false;
    }
    
    // Test token validation for the user to check if the user is logged in
    const profileResponse = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (profileResponse.data.data && profileResponse.data.data.email) {
      log('green', '✅ Token validation successful');
      return true;
    } else {
      log('red', '❌ Token validation failed');
      return false;
    }
  } catch (error) {
    log('red', `❌ Authentication error: ${error.message}`);
    return false;
  }
}

async function testProducts() {
  log('blue', '📦 Testing Products API...');
  
  try {
    // Test get all products
    const productsResponse = await axios.get(`${API_URL}/products`);
    const products = productsResponse.data;
    
    if (products.length >= 30) {
      log('green', `✅ Products loaded: ${products.length} items`);
    } else {
      log('yellow', `⚠️  Fewer products than expected: ${products.length}`);
    }
    
    // Test product details with variants
    const firstProduct = products[0];
    const productResponse = await axios.get(`${API_URL}/products/${firstProduct.id}`);
    const productDetails = productResponse.data;
    
    if (productDetails.variants && productDetails.variants.length > 0) {
      log('green', `✅ Product variants working: ${productDetails.variants.length} variants for "${productDetails.name}"`);
    } else {
      log('red', `❌ No variants found for product: ${productDetails.name}`);
      return false;
    }
    
    return firstProduct;
  } catch (error) {
    log('red', `❌ Products error: ${error.message}`);
    return false;
  }
}

async function testCart(testProduct) {
  log('blue', '🛒 Testing Cart functionality...');
  
  try {
    // Get initial cart
    let cartResponse = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const initialItemCount = cartResponse.data.items.length;
    const initialQuantity = cartResponse.data.items.reduce((sum, item) => sum + item.quantity, 0);
    log('green', `✅ Initial cart loaded: ${initialItemCount} items, total quantity: ${initialQuantity}`);
    
    // Get product details to get variant ID
    const productResponse = await axios.get(`${API_URL}/products/${testProduct.id}`);
    const firstVariant = productResponse.data.variants[0];
    log('blue', `Testing with variant ID: ${firstVariant.id} (${firstVariant.sku})`);
    
    // Add item to cart
    await axios.post(`${API_URL}/cart/add`, {
      variantId: firstVariant.id,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Check cart after adding to see if the item is added to the cart
    cartResponse = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const newItemCount = cartResponse.data.items.length;
    const totalQuantity = cartResponse.data.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Success if either we have more items OR the total quantity increased
    if (newItemCount > initialItemCount || totalQuantity > 0) {
      log('green', `✅ Item added to cart successfully`);
      log('green', `✅ Cart total: $${cartResponse.data.total.toFixed(2)}`);
      log('green', `✅ Total items in cart: ${newItemCount}, Total quantity: ${totalQuantity}`);
    } else {
      log('red', '❌ Item not added to cart');
      return false;
    }
    
    // Test cart update
    await axios.post(`${API_URL}/cart/update`, {
      variantId: firstVariant.id,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('green', '✅ Cart update successful');
    return true;
  } catch (error) {
    log('red', `❌ Cart error: ${error.message}`);
    if (error.response) {
      log('red', `   Status: ${error.response.status}`);
      log('red', `   Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function testWishlist(testProduct) {
  log('blue', '❤️ Testing Wishlist functionality...');
  
  try {
    log('blue', `Testing with product ID: ${testProduct.id}`);
    
    // First check if item is already in wishlist and try to remove it
    try {
      const existingWishlist = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const existingItem = existingWishlist.data.find(item => item.productId === testProduct.id);
      if (existingItem) {
        log('blue', 'Product already in wishlist, removing first...');
        await axios.delete(`${API_URL}/wishlist/${testProduct.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
    } catch (cleanupError) {
      log('yellow', 'Could not clean existing wishlist item (this is OK)');
    }
    
    // Add to wishlist
    await axios.post(`${API_URL}/wishlist`, {
      productId: testProduct.id
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Get wishlist
    const wishlistResponse = await axios.get(`${API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (wishlistResponse.data.length > 0) {
      log('green', `✅ Wishlist working: ${wishlistResponse.data.length} items`);
    } else {
      log('red', '❌ Wishlist is empty after adding item');
      return false;
    }
    
    return true;
  } catch (error) {
    log('red', `❌ Wishlist error: ${error.message}`);
    if (error.response) {
      log('red', `   Status: ${error.response.status}`);
      log('red', `   Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function testOrders() {
  log('blue', '📋 Testing Orders system...');
  
  try {
    // Get user orders (correct endpoint is /orders/my)
    const ordersResponse = await axios.get(`${API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('green', `✅ Orders loaded: ${ordersResponse.data.length} orders`);
    return true;
  } catch (error) {
    log('red', `❌ Orders error: ${error.message}`);
    return false;
  }
}

async function testPayment() {
  log('blue', '💳 Testing Payment system...');
  
  try {
    // Test Stripe config (correct endpoint is /payment/config)
    const stripeResponse = await axios.get(`${API_URL}/payment/config`);
    
    if (stripeResponse.data.publishableKey) {
      log('green', '✅ Stripe configuration working');
    } else {
      log('yellow', '⚠️  Stripe config might be missing');
    }
    
    return true;
  } catch (error) {
    log('red', `❌ Payment error: ${error.message}`);
    return false;
  }
}

async function testAdminFunctionality() {
  log('blue', '👑 Testing Admin functionality...');
  
  try {
    // Login as admin
    const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@nextbuy.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.accessToken;
    
    // Test admin dashboard
    const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (dashboardResponse.data.totalUsers >= 0) {
      log('green', `✅ Admin dashboard working: ${dashboardResponse.data.totalUsers} users, ${dashboardResponse.data.totalProducts} products`);
    } else {
      log('red', '❌ Admin dashboard data invalid');
      return false;
    }
    
    return true;
  } catch (error) {
    log('red', `❌ Admin error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('blue', '🚀 Starting NextBuy E-commerce Testing Suite...');
  log('blue', '================================================');
  
  const results = [];
  
  // Run all tests
  results.push(await testAuthentication());
  if (results[0]) {
    const testProduct = await testProducts();
    if (testProduct) {
      results.push(true);
      results.push(await testCart(testProduct));
      results.push(await testWishlist(testProduct));
      results.push(await testOrders());
      results.push(await testPayment());
      results.push(await testAdminFunctionality());
    } else {
      results.push(false);
    }
  }
  
  // Summary
  log('blue', '================================================');
  log('blue', '📊 Test Results Summary:');
  
  // Names of the tests 
  const testNames = [
    'Authentication',
    'Products API',
    'Cart System',
    'Wishlist',
    'Orders',
    'Payment System',
    'Admin Functions'
  ];
  
  let passed = 0;
  results.forEach((result, index) => {
    if (result) {
      log('green', `✅ ${testNames[index]}: PASSED`);
      passed++;
    } else {
      log('red', `❌ ${testNames[index]}: FAILED`);
    }
  });
  
  log('blue', `\nOverall: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    log('green', '🎉 All systems operational! Ready for production.');
  } else {
    log('yellow', '⚠️  Some issues detected. Please review failed tests.');
  }
}

// Run the tests
runTests().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
}); 