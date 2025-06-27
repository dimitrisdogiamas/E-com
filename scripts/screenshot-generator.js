const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = './screenshots';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pages = [
  {
    name: 'homepage',
    url: '/',
    description: 'NextBuy Homepage',
  },
  {
    name: 'products',
    url: '/products',
    description: 'Product Catalog',
  },
  {
    name: 'login',
    url: '/auth/login',
    description: 'User Login',
  },
  {
    name: 'register',
    url: '/auth/register',
    description: 'User Registration',
  },
  {
    name: 'cart',
    url: '/cart',
    description: 'Shopping Cart',
  },
  {
    name: 'admin-dashboard',
    url: '/admin',
    description: 'Admin Dashboard',
  },
  {
    name: 'admin-products',
    url: '/admin/products',
    description: 'Admin Products',
  },
  {
    name: 'admin-orders',
    url: '/admin/orders',
    description: 'Admin Orders',
  },
  {
    name: 'chat',
    url: '/chat',
    description: 'Chat Interface',
  },
  {
    name: 'profile',
    url: '/profile',
    description: 'User Profile',
  },
  {
    name: 'wishlist',
    url: '/wishlist',
    description: 'User Wishlist',
  },
  {
    name: 'search',
    url: '/search',
    description: 'Product Search',
  },
];

async function takeScreenshots() {
  console.log('🚀 Starting screenshot generation...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  
  // Set up authentication if needed
  const mockJWT = 'your-test-jwt-token';
  await page.evaluateOnNewDocument((token) => {
    localStorage.setItem('authToken', token);
  }, mockJWT);

  for (const pageInfo of pages) {
    try {
      console.log(`📸 Taking screenshot: ${pageInfo.description}`);
      
      await page.goto(`${BASE_URL}${pageInfo.url}`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      // Wait for React components to load
      await page.waitForTimeout(2000);

      // Take full page screenshot
      const screenshot = await page.screenshot({
        path: path.join(OUTPUT_DIR, `${pageInfo.name}.png`),
        fullPage: true,
        quality: 90
      });

      console.log(`✅ Screenshot saved: ${pageInfo.name}.png`);

    } catch (error) {
      console.error(`❌ Error taking screenshot for ${pageInfo.name}:`, error.message);
    }
  }

  await browser.close();
  console.log('🎉 Screenshot generation completed!');
  console.log(`📁 Screenshots saved in: ${OUTPUT_DIR}`);
}

// Mock data setup function
async function setupMockData() {
  console.log('🔧 Setting up mock data...');
  
  // You can add API calls here to create test data
  // Example:
  /*
  const axios = require('axios');
  await axios.post('http://localhost:4001/auth/register', {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  });
  */
}

// Usage instructions
function printInstructions() {
  console.log(`
🎯 NextBuy Screenshot Generator
============================

📋 Prerequisites:
1. Install puppeteer: npm install puppeteer
2. Start your frontend: cd front-end/nextbuy && npm run dev
3. Start your backend: npm run start:dev
4. Run this script: node scripts/screenshot-generator.js

📸 Screenshots will be saved in: ${OUTPUT_DIR}

💡 Tips:
- Make sure both frontend and backend are running
- Add test data to your database for better screenshots
- Screenshots are taken at 1920x1080 resolution
- You can edit the 'pages' array to add/remove pages

🖼️ For thesis use:
- Screenshots will be saved as PNG files
- High quality (90% compression)
- Ready to insert in your document
`);
}

// Main execution
if (require.main === module) {
  printInstructions();
  
  // Uncomment to run screenshot generation
  // setupMockData()
  //   .then(() => takeScreenshots())
  //   .catch(console.error);
}

module.exports = { takeScreenshots, setupMockData }; 