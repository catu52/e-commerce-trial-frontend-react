import React from 'react';
import type { Currency, Product } from '../types';
import { formatPrice } from '../data/mockData';
import { isDiscounted } from '../lib/sale';

export const SaleBadge: React.FC<{ product: Product; className?: string }> = ({ product, className = '' }) =>
  isDiscounted(product) ? (
    <span
      className={`inline-block px-2 py-0.5 bg-secondary text-on-error font-headline text-[10px] font-bold tracking-wider ${className}`}
    >
      -{product.discountPercent}%
    </span>
  ) : null;

interface PriceProps {
  product: Product;
  currency: Currency;
  price?: number;
  className?: string;
}

/** Effective price, with the struck-through original price when the product is discounted. */
export const SalePrice: React.FC<PriceProps> = ({ product, currency, price, className = '' }) => {
  const current = price ?? product.priceEUR;
  if (!isDiscounted(product)) return <span className={className}>{formatPrice(current, currency)}</span>;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="text-secondary">{formatPrice(current, currency)}</span>
      <s data-testid="compare-at-price" className="text-on-surface-variant font-normal text-[0.8em]">
        {formatPrice(product.compareAtPriceEUR as number, currency)}
      </s>
    </span>
  );
};
