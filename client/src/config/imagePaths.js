// Centralized image paths configuration
// This helps avoid case sensitivity issues in production

export const IMAGE_PATHS = {
  // Assets folder images
  ABOUT_IMAGE_1: '/images/assets/Image1.jpg',
  ABOUT_IMAGE_2: '/images/assets/Image2.jpg', 
  ABOUT_IMAGE_3: '/images/assets/image3.jpg',
  ABOUT_IMAGE_4: '/images/assets/image4.jpg',
  
  // Logo and brand images
  LOGO: '/images/logo.png',
  LOGO_SMALL: '/images/logo56.png',
  BANNER: '/images/banner.png',
  
  // Fallback images
  FALLBACK_HOTEL: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  FALLBACK_ROOM: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  FALLBACK_SHOP: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
};

// Helper function to get image with fallback
export const getImageWithFallback = (imagePath, fallbackPath) => {
  return imagePath || fallbackPath;
};
