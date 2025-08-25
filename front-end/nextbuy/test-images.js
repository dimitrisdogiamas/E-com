// Quick test of image utility functions
const { getProductImageUrl } = require('./src/app/lib/imageUtils');

// Test products without images
const greySweatpants = {
  id: '1',
  name: 'Grey Sweatpants',
  category: 'clothing',
  images: []
};

const vintageBlackTee = {
  id: '2', 
  name: 'Vintage Black Band Tee',
  category: 'apparel',
  images: []
};

console.log('=== Image URL Test Results ===');
console.log('Grey Sweatpants:', getProductImageUrl(greySweatpants));
console.log('Vintage Black Band Tee:', getProductImageUrl(vintageBlackTee));

// Test with some other products
const testProducts = [
  { id: '3', name: 'Winter Jacket', category: 'outerwear', images: [] },
  { id: '4', name: 'Running Shoes', category: 'footwear', images: [] },
  { id: '5', name: 'Designer Handbag', category: 'accessories', images: [] },
  { id: '6', name: 'Casual Dress', category: 'clothing', images: [] }
];

testProducts.forEach(product => {
  console.log(`${product.name}:`, getProductImageUrl(product));
});