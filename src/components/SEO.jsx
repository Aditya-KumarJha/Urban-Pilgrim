import { useEffect } from 'react';

export default function SEO({ 
  title = 'Urban Pilgrim | Wellness Events & Retreats', 
  description = 'Find and book upcoming wellness events, workshops, and classes led by trusted Urban Pilgrim guides—happening near you and across soulful spaces',
  keywords = 'urban pilgrim, wellness, events, retreats, yoga, meditation, breathwork',
  canonicalUrl = '',
  ogImage = '/public/assets/urban_pilgrim_logo.png',
  ogType = 'website',
  children
}) {
  useEffect(() => {
    const siteUrl = window.location.origin;
    const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
    const imageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
    
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', imageUrl, true);
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', fullUrl);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);
    
    // Cleanup function to restore original title if needed
    return () => {
      // Optionally restore original title when component unmounts
      // document.title = 'Urban Pilgrim | Wellness Events & Retreats';
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType]);
  
  // This component doesn't render anything visible
  return null;
}
