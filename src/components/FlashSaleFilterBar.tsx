import React from 'react';
import type { FlashSaleFilters, FlashSaleMeta, FlashSaleSort, FlashSaleTier } from '../types';
import { FLASH_SALE_SIZES, FLASH_SALE_SORTS, FLASH_SALE_TIERS } from '../config';

interface Props {
  filters: FlashSaleFilters;
  meta: FlashSaleMeta | null;
  onChange: (patch: Partial<FlashSaleFilters>) => void;
}

const tierClass = (key: FlashSaleTier, active: boolean): string => {
  if (active) return 'bg-primary text-on-primary';
  if (key === '60') return 'bg-secondary text-on-error';
  return 'bg-surface-container-lowest text-primary';
};

export const FlashSaleFilterBar: React.FC<Props> = ({ filters, meta, onChange }) => (
  <section className="sticky top-20 z-40 bg-surface-bright/95 backdrop-blur-md border-b-2 border-primary px-6 lg:px-12 py-3">
    <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none font-headline text-xs font-bold uppercase tracking-wider">
        {FLASH_SALE_TIERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange({ tier: key })}
            className={`px-3 py-1.5 border border-primary hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap cursor-pointer ${tierClass(key, filters.tier === key)}`}
          >
            {label} [{meta?.tiers?.[key] ?? 0}]
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1 xl:pt-0 border-t border-outline-variant xl:border-t-0 font-headline text-xs uppercase">
        <div className="flex items-center border border-primary bg-surface-container-lowest">
          <span className="text-[10px] font-mono px-2 py-1 text-on-surface-variant border-r border-primary font-bold">SIZE:</span>
          {FLASH_SALE_SIZES.map((size, i) => (
            <button
              key={size}
              onClick={() => onChange({ size: filters.size === size ? '' : size })}
              className={`px-2 py-1 hover:bg-primary-container font-bold text-xs cursor-pointer ${i > 0 ? 'border-l border-outline-variant' : ''} ${filters.size === size ? 'bg-primary text-on-primary' : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="relative flex items-center border border-primary bg-surface-container-lowest px-2 py-1">
          <span className="text-[10px] font-mono text-on-surface-variant mr-1.5 font-bold">CAT:</span>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="bg-transparent font-bold cursor-pointer focus:outline-none pr-3 text-xs"
          >
            <option value="">ALL SECTORS</option>
            {(meta?.categories ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name.toUpperCase()} [{c.count}]
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex items-center border border-primary bg-primary-container px-2 py-1 font-bold">
          <span className="text-[10px] font-mono text-on-primary-container mr-1.5">SORT:</span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as FlashSaleSort })}
            className="bg-transparent font-bold cursor-pointer focus:outline-none pr-2 text-xs"
          >
            {FLASH_SALE_SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </section>
);
