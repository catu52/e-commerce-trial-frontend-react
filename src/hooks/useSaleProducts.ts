import { useCallback, useEffect, useState } from 'react';
import type { Product } from '../types';
import { getSaleProducts } from '../services/catalog';
import { ApiError } from '../lib/api';

export function useSaleProducts(minDiscount?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [maxDiscount, setMaxDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSaleProducts(minDiscount)
      .then((res) => {
        if (cancelled) return;
        setProducts(res.products);
        // A min_discount filter never lowers the max, but keep the last known one if the API omits it.
        setMaxDiscount((prev) => res.maxDiscount ?? (res.products.length ? prev : null));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load sale products.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [minDiscount, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { products, maxDiscount, loading, error, reload };
}
