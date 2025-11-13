import { useState, useEffect, useRef } from 'react';

/**
 * OptimizedImage Component
 * A drop-in replacement for <img> tags with lazy loading
 * Maintains exact same UI/UX as standard img tags - NO CACHING to avoid stale images
 */
const OptimizedImage = ({ 
  src, 
  alt = '', 
  className = '', 
  style = {},
  loading = 'lazy',
  onLoad,
  onError,
  ...rest 
}) => {
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!src || loading === 'eager') {
      return;
    }

    // For lazy loading, use Intersection Observer
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current);
              }
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      setShouldLoad(true);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src, loading]);

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? src : undefined}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onLoad={onLoad}
      onError={onError}
      {...rest}
    />
  );
};

export default OptimizedImage;
