import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

export const useSearch = (items, keys, options = {}) => {
  const [query, setQuery] = useState('');

  // ✅ Alternative: Include options directly in dependency array
  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys,
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: false,
      minMatchCharLength: 1,
      shouldSort: true,
      ...options
    });
  }, [items, keys, options]); // ✅ ESLint will be happy with this

  const results = useMemo(() => {
    if (!query.trim()) return items;
    
    if (query.trim().length < 2) {
      const searchTerm = query.toLowerCase();
      return items.filter(item => 
        keys.some(key => {
          const value = item[key];
          if (Array.isArray(value)) {
            return value.some(v => v.toLowerCase().includes(searchTerm));
          }
          return value?.toLowerCase().includes(searchTerm);
        })
      );
    }

    return fuse.search(query).map(result => result.item);
  }, [query, fuse, items, keys]);

  const setQueryCallback = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  return useMemo(() => ({
    query,
    setQuery: setQueryCallback,
    results
  }), [query, setQueryCallback, results]);
};
