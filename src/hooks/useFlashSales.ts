import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlashSale, FlashSaleFilters, FlashSaleMeta } from '../types';
import { getFlashSales } from '../services/flashSales';
import { ApiError } from '../lib/api';
import { FLASH_SALE_PAGE_SIZE } from '../config';

export function useFlashSales(filters: FlashSaleFilters, perPage: number = FLASH_SALE_PAGE_SIZE) {
  const [items, setItems] = useState<FlashSale[]>([]);
  const [meta, setMeta] = useState<FlashSaleMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const pageRef = useRef<number>(1);
  const silentRef = useRef<boolean>(false);

  const { tier, category, size, sort } = filters;

  useEffect(() => {
    let cancelled = false;
    // Silent reloads (e.g. after a reservation) keep the current grid visible.
    if (!silentRef.current) setLoading(true);
    silentRef.current = false;
    setError(null);
    pageRef.current = 1;
    getFlashSales({ tier, category, size, sort, page: 1, perPage })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load flash sales.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tier, category, size, sort, perPage, reloadKey]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const res = await getFlashSales({ tier, category, size, sort, page: pageRef.current + 1, perPage });
      pageRef.current += 1;
      setItems((prev) => [...prev, ...res.data.filter((d) => !prev.some((p) => p.id === d.id))]);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load more.');
    } finally {
      setLoadingMore(false);
    }
  }, [tier, category, size, sort, perPage]);

  const reload = useCallback(() => {
    silentRef.current = true;
    setReloadKey((k) => k + 1);
  }, []);
  const hasMore = !!meta && meta.current_page < meta.last_page;

  return { items, meta, loading, loadingMore, error, hasMore, loadMore, reload };
}
