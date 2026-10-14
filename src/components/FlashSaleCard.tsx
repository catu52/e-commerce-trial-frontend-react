import React, { useState } from 'react';
import type { Currency, FlashSale } from '../types';
import { formatPrice } from '../data/mockData';
import { useCountdown } from '../hooks/useCountdown';

interface Props {
  sale: FlashSale;
  currency: Currency;
  serverTime: string | null;
  onReserve: (sale: FlashSale) => Promise<void>;
}

const StartsIn: React.FC<{ startsAt: string; serverTime: string | null }> = ({ startsAt, serverTime }) => {
  const { hours, minutes, seconds } = useCountdown(startsAt, serverTime);
  return <span>STARTS IN {hours}:{minutes}:{seconds}</span>;
};

export const FlashSaleCard: React.FC<Props> = ({ sale, currency, serverTime, onReserve }) => {
  const [busy, setBusy] = useState(false);
  const { product } = sale;
  const upcoming = sale.status === 'upcoming';
  const soldOut = sale.availableStock <= 0;
  const critical = sale.stockState === 'critical';
  const disabled = busy || upcoming || soldOut;

  const handleClick = async () => {
    setBusy(true);
    try {
      await onReserve(sale);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group bg-surface-container-lowest border-2 border-primary flex flex-col justify-between hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all">
      <div>
        <div className="relative w-full aspect-[3/4] bg-surface-container-high border-b-2 border-primary overflow-hidden">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={product.title}
            loading="lazy"
            src={product.image}
          />
          <div className="absolute top-2 left-2 bg-secondary text-on-error font-headline font-bold text-[11px] uppercase tracking-wider px-2 py-1 border border-primary">
            -{sale.discountPercent}% ARCHIVE DISCOUNT
          </div>
          <div className="absolute top-2 right-2 bg-primary text-on-primary font-mono text-[9px] uppercase px-1.5 py-0.5">
            {product.code}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
              {product.sku} // {product.category}
            </span>
            {upcoming && <span className="text-[10px] font-mono text-secondary font-bold">UPCOMING</span>}
          </div>
          <h2 className="font-headline font-bold text-sm lg:text-base uppercase tracking-tight text-primary leading-tight">
            {product.title}
          </h2>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-headline text-lg font-bold text-secondary">{formatPrice(sale.salePrice, currency)}</span>
            <span className="font-mono text-xs text-on-surface-variant line-through">
              {formatPrice(sale.originalPrice, currency)}
            </span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-mono font-bold">
              <span className={sale.stockState === 'ok' ? 'text-on-surface-variant' : 'text-secondary'}>
                {soldOut
                  ? 'SOLD OUT'
                  : critical
                    ? `CRITICAL: ONLY ${sale.availableStock} UNITS`
                    : `${sale.stockState === 'low' ? 'LOW: ' : ''}${sale.availableStock} UNITS`}
              </span>
              <span className="text-on-surface-variant">{sale.depletionPercent}% DEPLETED</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest border border-primary overflow-hidden">
              <div className="h-full bg-secondary" style={{ width: `${Math.min(100, sale.depletionPercent)}%` }}></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 pt-1 font-mono text-[10px]">
            {product.sizes.map((size) => (
              <span key={size} className="px-1.5 py-0.5 border border-primary bg-surface-container-low font-bold">
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <button
          onClick={handleClick}
          disabled={disabled}
          className="w-full py-2.5 bg-primary text-on-primary border border-primary font-headline text-xs font-bold uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container hover:border-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:text-on-primary cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>
            {soldOut ? 'SOLD OUT' : upcoming ? <StartsIn startsAt={sale.startsAt} serverTime={serverTime} /> : busy ? 'ALLOCATING...' : 'INSTANT ALLOCATION'}
          </span>
        </button>
      </div>
    </div>
  );
};
