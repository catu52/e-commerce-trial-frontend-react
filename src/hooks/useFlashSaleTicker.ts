import { useEffect, useState } from 'react';
import { getFlashSales } from '../services/flashSales';

/** Lightweight fetch of the next flash-sale end time (single-item page). */
export function useFlashSaleTicker() {
  const [nextEndsAt, setNextEndsAt] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFlashSales({ perPage: 1 })
      .then((res) => {
        if (cancelled) return;
        setNextEndsAt(res.meta.nextEndsAt);
        setServerTime(res.meta.serverTime);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return { nextEndsAt, serverTime };
}
