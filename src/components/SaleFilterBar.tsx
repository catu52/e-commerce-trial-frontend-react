import React from 'react';
import { availableTiers, SALE_SORT_LABELS, type SaleSort } from '../lib/sale';

interface Props {
  maxDiscount: number | null;
  minDiscount?: number;
  sort: SaleSort;
  onMinDiscountChange: (value?: number) => void;
  onSortChange: (value: SaleSort) => void;
}

const chip = (active: boolean) =>
  `px-3 py-1.5 border-2 border-primary font-headline text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
    active ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-primary hover:bg-primary-container'
  }`;

export const SaleFilterBar: React.FC<Props> = ({ maxDiscount, minDiscount, sort, onMinDiscountChange, onSortChange }) => (
  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-primary">
    <div role="group" aria-label="Discount filter" className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={!minDiscount} className={chip(!minDiscount)} onClick={() => onMinDiscountChange(undefined)}>
        All sale
      </button>
      {availableTiers(maxDiscount).map((tier) => (
        <button
          key={tier}
          type="button"
          aria-pressed={minDiscount === tier}
          className={chip(minDiscount === tier)}
          onClick={() => onMinDiscountChange(tier)}
        >
          {tier}%+ off
        </button>
      ))}
    </div>
    <label className="flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-wider">
      Sort
      <select
        aria-label="Sort sale products"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SaleSort)}
        className="border-2 border-primary bg-surface-container-lowest px-2 py-1 cursor-pointer"
      >
        {(Object.keys(SALE_SORT_LABELS) as SaleSort[]).map((key) => (
          <option key={key} value={key}>
            {SALE_SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </label>
  </div>
);
