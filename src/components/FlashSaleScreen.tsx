import React, { useState } from 'react';
import type { Currency, FlashSale, FlashSaleFilters } from '../types';
import { FLASH_SALE_DEFAULT_FILTERS } from '../config';
import { useAuth } from '../context/AuthContext';
import { useFlashSales } from '../hooks/useFlashSales';
import { reserveFlashSale } from '../services/flashSales';
import { ApiError } from '../lib/api';
import { FlashSaleBanner } from './FlashSaleBanner';
import { FlashSaleHero } from './FlashSaleHero';
import { FlashSaleFilterBar } from './FlashSaleFilterBar';
import { FlashSaleCard } from './FlashSaleCard';
import { FlashSalePerks } from './FlashSalePerks';
import { FlashSaleNewsletter } from './FlashSaleNewsletter';

interface Props {
  currency: Currency;
  onShowToast: (message: string) => void;
  onOpenAuth: () => void;
}

export const FlashSaleScreen: React.FC<Props> = ({ currency, onShowToast, onOpenAuth }) => {
  const { client } = useAuth();
  const [filters, setFilters] = useState<FlashSaleFilters>(FLASH_SALE_DEFAULT_FILTERS);
  const { items, meta, loading, loadingMore, error, hasMore, loadMore, reload } = useFlashSales(filters);

  const handleReserve = async (sale: FlashSale) => {
    if (!client) {
      onOpenAuth();
      onShowToast('LOG IN OR REGISTER TO SECURE AN ALLOCATION');
      return;
    }
    try {
      const res = await reserveFlashSale(sale.id);
      onShowToast(res.message || 'ALLOCATION PROCESSING');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onOpenAuth();
        onShowToast('SESSION EXPIRED. LOG IN AGAIN.');
      } else {
        onShowToast(err instanceof ApiError ? err.message : 'ALLOCATION FAILED. TRY AGAIN.');
      }
    }
    reload();
  };

  const remaining = meta ? Math.max(0, meta.total - items.length) : 0;
  const endsAt = meta?.nextEndsAt ?? null;
  const serverTime = meta?.serverTime ?? null;

  return (
    <div className="flex flex-col w-full bg-background">
      <FlashSaleBanner endsAt={endsAt} serverTime={serverTime} />
      <FlashSaleHero endsAt={endsAt} serverTime={serverTime} />
      <FlashSaleFilterBar filters={filters} meta={meta} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
        <div className="flex items-center justify-between pb-4 mb-8 border-b-2 border-primary font-headline text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-secondary"></span>
            <span>INDEXED CLEARANCE MANIFEST // BATCH 2024-FL</span>
          </div>
          <div className="font-mono text-on-surface-variant text-[11px]">
            SHOWING {items.length} OF {meta?.total ?? 0} SPECIMENS ALLOCATED
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center font-mono text-sm uppercase">LOADING CLEARANCE MANIFEST...</div>
        ) : error && items.length === 0 ? (
          <div className="py-16 text-center font-mono text-sm uppercase space-y-4">
            <div className="text-secondary font-bold">MANIFEST UNAVAILABLE: {error}</div>
            <button
              onClick={reload}
              className="border-2 border-primary bg-primary-container px-4 py-2 font-bold hover:bg-primary hover:text-primary-container cursor-pointer"
            >
              RETRY
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center font-mono text-sm uppercase text-on-surface-variant">
            NO SPECIMENS MATCH THE CURRENT FILTERS.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((sale) => (
              <FlashSaleCard key={sale.id} sale={sale} currency={currency} serverTime={serverTime} onReserve={handleReserve} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-12 p-6 bg-surface-container border-2 border-primary flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="font-headline font-bold text-sm uppercase">
                REMAINING ARCHIVE CAPACITY: {remaining} SPECIMENS PENDING
              </div>
              <p className="font-mono text-xs text-on-surface-variant uppercase">
                DECOMMISSIONED ASSETS AUTOMATICALLY PURGED AT MIDNIGHT PROTOCOL.
              </p>
            </div>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-surface-container-lowest text-primary border-2 border-primary font-headline text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loadingMore ? 'FETCHING...' : `FETCH ADDITIONAL ARCHIVE TIERS [+${remaining}]`}
            </button>
          </div>
        )}
      </section>

      <FlashSalePerks />
      <FlashSaleNewsletter onShowToast={onShowToast} />
    </div>
  );
};
