import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

export const useSearch = (items, keys, options = {}) => {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys,
      threshold: 0.3,
      includeScore: true,
      ...options
    });
  }, [items, keys, options]);

  const results = useMemo(() => {
    if (!query.trim()) return items;
    return fuse.search(query).map(result => result.item);
  }, [query, fuse, items]);

  return { query, setQuery, results };
};
