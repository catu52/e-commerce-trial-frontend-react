import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { getProduct } from '../services/catalog';
import { ApiError } from '../lib/api';

export type ProductBySlug =
  | { status: 'loading'; product?: undefined }
  | { status: 'found'; product: Product }
  | { status: 'not-found'; product?: undefined }
  | { status: 'error'; product?: undefined; message: string };

/**
 * Resolves a product from its URL slug. Uses the already-loaded catalog when it
 * has the product and otherwise fetches it, so deep links and refreshes work.
 */
export function useProductBySlug(slug: string | undefined, loaded: Product[]): ProductBySlug {
  const fromList = slug ? loaded.find((p) => p.slug === slug) : undefined;
  const [fetched, setFetched] = useState<{ slug: string; state: ProductBySlug } | null>(null);

  useEffect(() => {
    if (!slug || fromList) return;
    let cancelled = false;
    getProduct(slug)
      .then((product) => !cancelled && setFetched({ slug, state: { status: 'found', product } }))
      .catch((err) => {
        if (cancelled) return;
        const state: ProductBySlug =
          err instanceof ApiError && err.status === 404
            ? { status: 'not-found' }
            : { status: 'error', message: err instanceof ApiError ? err.message : 'Failed to load product.' };
        setFetched({ slug, state });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, fromList]);

  if (!slug) return { status: 'not-found' };
  if (fromList) return { status: 'found', product: fromList };
  if (fetched && fetched.slug === slug) return fetched.state;
  return { status: 'loading' };
}
