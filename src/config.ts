import type { CatalogSection, Currency, FlashSaleFilters, FlashSaleSort, FlashSaleTier } from './types';

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '');

export const SITE_URL: string = (
  import.meta.env.VITE_SITE_URL || window.location.origin
).replace(/\/+$/, '');

export const CONTENT_TIMEOUT_MS = 5000;

export const STORAGE_KEYS = {
  cart: 'kraft.cart',
  authToken: 'kraft.authToken',
} as const;

export const TOAST_DURATION_MS = 3200;
export const CATALOG_PAGE_SIZE = 100;
export const SECTION_LABELS: Record<CatalogSection, string> = {
  all: 'NEW ARRIVALS',
  men: 'MEN',
  women: 'WOMEN',
  unisex: 'UNISEX',
};
export const DEFAULT_CURRENCY: Currency = 'EUR';
export const DEFAULT_COUNTRY = 'Germany';
export const DEFAULT_PAYMENT_METHOD = 'card';

// Mock-only complement upsells (never sent to the backend).
export const COMPLEMENT_ID_PREFIX = 'comp-';
export const COMPLEMENT_DEFAULT_SIZE = 'M';
export const COMPLEMENT_COLOR = 'RAW CHALK';
export const COMPLEMENT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBwhgNYOFlgDvoaq0KO0GY2kf5-9u445l-_jdmpsfz_QKx233B2jRlnEoWBXXiNYb53DpyMykOIB2dj2WZU3DentBUQbI0-fkhDghaqIV7ZvucJN9YFi9GaHfYvHCLCn0IvMpOIMw-PlQDH5pYE_QVhgDD_nGcI0rTnKloqhk48FzH8peT0o2893H9bESTy0wibzqIE1WGkS5Vzlz_rv_4w-j8XEnI8b8sFgz9zO8Wa1KHDkaS4L-qF';

export type DeliveryMethod = 'standard' | 'express' | 'sameday';
export type DispatchSpeed = 'standard' | 'priority' | 'express';

// UI dispatch tier -> backend delivery method.
export const DISPATCH_TO_DELIVERY_METHOD: Record<DispatchSpeed, DeliveryMethod> = {
  standard: 'standard',
  priority: 'express',
  express: 'sameday',
};

// Display/preview only: the backend computes the authoritative delivery cost.
export const DELIVERY_COST_PREVIEW_EUR: Record<DeliveryMethod, number> = {
  standard: 0,
  express: 15,
  sameday: 25,
};

// Display/preview only: the backend applies the authoritative promo discount.
export const PROMO_CODES = ['BAUHAUS10', 'KRAFT'] as const;
export const PROMO_DISCOUNT_RATE = 0.1;
export const VAT_RATE = 0.19;

export const dispatchShippingPreview = (speed: DispatchSpeed | undefined): number =>
  DELIVERY_COST_PREVIEW_EUR[DISPATCH_TO_DELIVERY_METHOD[speed ?? 'standard']];

export const FLASH_SALE_PAGE_SIZE = 8;
export const FLASH_SALE_DEFAULT_FILTERS: FlashSaleFilters = {
  tier: 'all',
  category: '',
  size: '',
  sort: 'discount',
};
export const FLASH_SALE_TIERS: { key: FlashSaleTier; label: string }[] = [
  { key: 'all', label: 'ALL ARCHIVE' },
  { key: '40', label: '40% OFF OUTERWEAR' },
  { key: '50', label: '50% OFF TAILORING' },
  { key: '60', label: '60% OFF RUNWAY & ACC' },
];
export const FLASH_SALE_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
export const FLASH_SALE_SORTS: { key: FlashSaleSort; label: string }[] = [
  { key: 'discount', label: 'HIGHEST DISCOUNT' },
  { key: 'depletion', label: 'DEPLETION // CRITICAL' },
  { key: 'price_asc', label: 'PRICE: LOW → HIGH' },
  { key: 'price_desc', label: 'PRICE: HIGH → LOW' },
];
