import { preloadImages } from './imageCache';

/**
 * Preload common static images used across the app
 * Call this on app initialization for best performance
 */
export const preloadCommonImages = () => {
  const commonImages = [
    // Logo and branding
    '/urban_pilgrim_logo.png',
    '/retreats.svg',
    
    // Common icons (add more as needed)
    '/assets/yoga.svg',
    '/assets/bazar.svg',
    '/assets/golden-mandala.svg',
    '/assets/meditationimg.png',
    
    // Admin icons
    '/assets/admin/edit.svg',
    '/assets/admin/upload.svg',
    
    // Session icons
    '/assets/sessions/calendar.svg',
    '/assets/sessions/video.svg',
    '/assets/sessions/cart.svg',
    
    // Retreat icons
    '/assets/retreats/Location.svg',
    '/assets/retreats/card_tick.svg',
  ];
  
  return preloadImages(commonImages);
};

/**
 * Preload images for a specific page
 * Call this when navigating to a new page
 */
export const preloadPageImages = (pageName, imageUrls = []) => {
  console.log(`Preloading images for ${pageName} page...`);
  return preloadImages(imageUrls);
};

/**
 * Preload hero/above-the-fold images
 * Call this immediately on page load
 */
export const preloadHeroImages = (heroImageUrls = []) => {
  return preloadImages(heroImageUrls);
};

/**
 * Example usage in App.jsx or main.jsx:
 * 
 * import { preloadCommonImages } from './utils/imagePreloader';
 * 
 * useEffect(() => {
 *   preloadCommonImages();
 * }, []);
 */
