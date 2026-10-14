import type { Product } from '../types';

export const DISCOUNT_TIERS = [20, 30, 40, 50] as const;
export type SaleSort = 'discount' | 'price-asc' | 'price-desc';

export const SALE_SORT_LABELS: Record<SaleSort, string> = {
  discount: 'Biggest discount',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

const MAX_MIN_DISCOUNT = 90;

/** Valid min_discount (1-90) or undefined. */
export function parseMinDiscount(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const n = Number(value);
  return n >= 1 && n <= MAX_MIN_DISCOUNT ? n : undefined;
}

export function parseSaleSort(value: string | null): SaleSort {
  return value === 'price-asc' || value === 'price-desc' ? value : 'discount';
}

/** Tiers offered for a catalog whose deepest discount is `maxDiscount`. */
export function availableTiers(maxDiscount: number | null): number[] {
  return maxDiscount ? DISCOUNT_TIERS.filter((t) => t <= maxDiscount) : [];
}

export function sortSaleProducts(products: Product[], sort: SaleSort): Product[] {
  const list = [...products];
  if (sort === 'price-asc') return list.sort((a, b) => a.priceEUR - b.priceEUR);
  if (sort === 'price-desc') return list.sort((a, b) => b.priceEUR - a.priceEUR);
  return list.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
}

export function isDiscounted(product: Product): boolean {
  return Boolean(product.onSale && product.discountPercent && product.compareAtPriceEUR);
}
