import { useCallback, useEffect, useState } from 'react';
import type { ArticlesPage, ArticlesParams } from '../types';
import { getArticles } from '../services/articles';
import { ApiError } from '../lib/api';

export function useArticles({ page, perPage, category }: ArticlesParams = {}) {
  const [data, setData] = useState<ArticlesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getArticles({ page, perPage, category })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load articles.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, perPage, category, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { articles: data?.articles ?? [], meta: data?.meta ?? null, categories: data?.categories ?? [], loading, error, reload };
}
