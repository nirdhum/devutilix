import { useEffect } from 'react';

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website'
}) => {
  useEffect(() => {
    const baseUrl = "https://devutilix.com/";
    
    // Update title
    if (title) {
      document.title = title;
    }

    // Function to update or create meta tag
    const updateMeta = (selector, content, property = 'content') => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (selector.includes('name=')) {
          meta.name = selector.match(/name="([^"]+)"/)[1];
        } else if (selector.includes('property=')) {
          meta.property = selector.match(/property="([^"]+)"/)[1];
        }
        document.head.appendChild(meta);
      }
      meta[property] = content;
    };

    // Update canonical link
    const updateCanonical = (url) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = url;
    };

    // Basic meta tags
    if (description) {
      updateMeta('meta[name="description"]', description);
    }
    if (keywords) {
      updateMeta('meta[name="keywords"]', keywords);
    }
    if (canonical) {
      updateCanonical(`${baseUrl}${canonical}`);
    }

    // Open Graph tags
    if (ogTitle || title) {
      updateMeta('meta[property="og:title"]', ogTitle || title);
    }
    if (ogDescription || description) {
      updateMeta('meta[property="og:description"]', ogDescription || description);
    }
    if (ogType) {
      updateMeta('meta[property="og:type"]', ogType);
    }
    if (canonical) {
      updateMeta('meta[property="og:url"]', `${baseUrl}${canonical}`);
    }
    if (ogImage) {
      updateMeta('meta[property="og:image"]', `${baseUrl}${ogImage}`);
    }

    // Twitter Card tags
    updateMeta('meta[name="twitter:card"]', 'summary_large_image');
    if (ogTitle || title) {
      updateMeta('meta[name="twitter:title"]', ogTitle || title);
    }
    if (ogDescription || description) {
      updateMeta('meta[name="twitter:description"]', ogDescription || description);
    }
    if (ogImage) {
      updateMeta('meta[name="twitter:image"]', `${baseUrl}${ogImage}`);
    }

    // Additional SEO tags
    updateMeta('meta[name="robots"]', 'index, follow');
    updateMeta('meta[name="author"]', 'Nirdhum');
    
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogType]);
};
