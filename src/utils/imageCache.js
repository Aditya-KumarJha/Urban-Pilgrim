/**
 * Image Caching Utility for Production Performance
 * Provides in-memory and localStorage caching for faster image loading
 */

// In-memory cache for instant access
const imageCache = new Map();

// LocalStorage key prefix
const CACHE_PREFIX = 'img_cache_';
const CACHE_VERSION = 'v1_';
const MAX_CACHE_SIZE = 50; // Maximum number of images to cache in localStorage
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generate a cache key from URL
 */
const getCacheKey = (url) => {
  return CACHE_PREFIX + CACHE_VERSION + btoa(url).substring(0, 50);
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_EXPIRY;
};

/**
 * Get image from memory cache
 */
export const getFromMemoryCache = (url) => {
  return imageCache.get(url);
};

/**
 * Store image in memory cache
 */
export const setInMemoryCache = (url, data) => {
  imageCache.set(url, data);
};

/**
 * Get image from localStorage cache
 */
export const getFromLocalCache = (url) => {
  try {
    const cacheKey = getCacheKey(url);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    if (!isCacheValid(timestamp)) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading from localStorage cache:', error);
    return null;
  }
};

/**
 * Store image in localStorage cache
 */
export const setInLocalCache = (url, data) => {
  try {
    const cacheKey = getCacheKey(url);
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    // Clean old cache entries if needed
    cleanupCache();
  } catch (error) {
    // If localStorage is full or unavailable, silently fail
    console.warn('Could not cache image in localStorage:', error);
  }
};

/**
 * Clean up old cache entries
 */
const cleanupCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    if (cacheKeys.length > MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = cacheKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: data.timestamp };
        } catch {
          return { key, timestamp: 0 };
        }
      });
      
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, cacheKeys.length - MAX_CACHE_SIZE);
      toRemove.forEach(({ key }) => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
};

/**
 * Preload an image and cache it
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL provided'));
      return;
    }
    
    // Check memory cache first
    const memoryCache = getFromMemoryCache(url);
    if (memoryCache) {
      resolve(url);
      return;
    }
    
    // Check localStorage cache
    const localCache = getFromLocalCache(url);
    if (localCache) {
      setInMemoryCache(url, localCache);
      resolve(url);
      return;
    }
    
    // Load image
    const img = new Image();
    
    img.onload = () => {
      // Store in both caches
      setInMemoryCache(url, url);
      setInLocalCache(url, url);
      resolve(url);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = (urls) => {
  return Promise.allSettled(urls.map(url => preloadImage(url)));
};

/**
 * Clear all image cache
 */
export const clearImageCache = () => {
  // Clear memory cache
  imageCache.clear();
  
  // Clear localStorage cache
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    cacheKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    return {
      memorySize: imageCache.size,
      localStorageSize: cacheKeys.length,
      maxSize: MAX_CACHE_SIZE
    };
  } catch (error) {
    return {
      memorySize: imageCache.size,
      localStorageSize: 0,
      maxSize: MAX_CACHE_SIZE
    };
  }
};
