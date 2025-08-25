/**
 * Image utility functions for handling fallbacks and optimization
 */

export const getImageUrl = (
  images: { url: string }[] | undefined,
  index: number = 0,
  fallbackId?: string,
  dimensions: { width: number; height: number } = { width: 400, height: 240 }
): string => {
  // Try to get the image at the specified index
  const imageUrl = images?.[index]?.url;

  if (imageUrl) {
    return imageUrl;
  }

  // Fallback to fashion-themed placeholder with product-specific seed
  const seed = fallbackId || 'default';
  return `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=80&auto=format&seed=${seed}`;
};

export const getProductImageUrl = (
  product: { id: string; images?: { url: string }[]; category?: string; name?: string },
  index: number = 0
): string => {
  // Try to get the image at the specified index
  const imageUrl = product.images?.[index]?.url;
  
  if (imageUrl) {
    return imageUrl;
  }
  
  // Try intelligent name-based image selection first
  if (product.name) {
    const nameBasedImage = getImageByProductName(product.name);
    if (nameBasedImage) {
      return nameBasedImage;
    }
  }
  
  // Use category-specific image if available
  if (product.category) {
    const categoryUrl = getCategoryImageUrl(product.category, product.id);
    return categoryUrl;
  }
  
  // Final fallback to fashion/clothing
  return getImageUrl(product.images, index, product.id);
};

export const getProductThumbnailUrl = (
  product: { id: string; images?: { url: string }[]; category?: string; name?: string },
  index: number = 0
): string => {
  // Try to get the image at the specified index
  const imageUrl = product.images?.[index]?.url;
  
  if (imageUrl) {
    // If we have an actual image, return it with thumbnail dimensions
    return imageUrl;
  }
  
  // Try intelligent name-based image selection first
  if (product.name) {
    const nameBasedImage = getImageByProductName(product.name);
    if (nameBasedImage) {
      return nameBasedImage.replace('w=400&h=240', 'w=200&h=200');
    }
  }
  
  // Use category-specific thumbnail if available
  if (product.category) {
    const categoryKey = product.category.toLowerCase();
    const categoryImage = categoryImages[categoryKey];
    if (categoryImage) {
      return categoryImage.replace('w=400&h=240', 'w=200&h=200');
    }
  }
  
  // Final fallback with thumbnail dimensions
  return getImageUrl(product.images, index, product.id, { width: 200, height: 200 });
};

// Categories for themed placeholder images - high quality fashion and lifestyle images
const categoryImages: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=240&fit=crop&q=80&auto=format',
  clothing: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=240&fit=crop&q=80&auto=format',
  fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=240&fit=crop&q=80&auto=format',
  apparel: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=240&fit=crop&q=80&auto=format',
  accessories: 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=400&h=240&fit=crop&q=80&auto=format',
  shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=240&fit=crop&q=80&auto=format',
  bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=240&fit=crop&q=80&auto=format',
  jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=240&fit=crop&q=80&auto=format',
  watches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=240&fit=crop&q=80&auto=format',
  books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=240&fit=crop&q=80&auto=format',
  home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=240&fit=crop&q=80&auto=format',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=240&fit=crop&q=80&auto=format',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=240&fit=crop&q=80&auto=format',
  skincare: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=240&fit=crop&q=80&auto=format'
};

// Product name-based intelligent image selection
const getImageByProductName = (productName: string): string | null => {
  const name = productName.toLowerCase();
  
  // T-shirts and tops
  if (name.includes('tee') || name.includes('t-shirt') || name.includes('shirt') || name.includes('top')) {
    return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  // Pants, jeans, sweatpants
  if (name.includes('pant') || name.includes('jean') || name.includes('trouser') || name.includes('sweatpant')) {
    return 'https://images.unsplash.com/photo-1506629905607-d7b8dc882a20?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  // Sweatshirts, hoodies
  if (name.includes('sweatshirt') || name.includes('hoodie') || name.includes('pullover')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  // Dresses
  if (name.includes('dress')) {
    return 'https://images.unsplash.com/photo-1566479179817-7e1cbacbfe70?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  // Jackets, coats
  if (name.includes('jacket') || name.includes('coat') || name.includes('blazer')) {
    return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  // Shoes
  if (name.includes('shoe') || name.includes('sneaker') || name.includes('boot') || name.includes('sandal')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  // Accessories
  if (name.includes('watch') || name.includes('bracelet') || name.includes('necklace') || name.includes('ring')) {
    return 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  // Bags
  if (name.includes('bag') || name.includes('backpack') || name.includes('purse') || name.includes('wallet')) {
    return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=240&fit=crop&q=80&auto=format';
  }
  
  return null;
};

export const getCategoryImageUrl = (
  category: string,
  productId: string
): string => {
  const categoryKey = category.toLowerCase();
  return categoryImages[categoryKey] || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=240&fit=crop&q=80&auto=format&seed=${productId}`;
};
