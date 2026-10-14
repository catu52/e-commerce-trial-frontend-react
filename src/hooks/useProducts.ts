import { useCallback, useEffect, useState } from 'react';
import type { CatalogSection, Product } from '../types';
import { getProducts } from '../services/catalog';
import { ApiError } from '../lib/api';

export function useProducts(section: CatalogSection = 'all') {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProducts(section === 'all' ? {} : { gender: section })
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load catalog.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, section]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { products, loading, error, reload };
}
