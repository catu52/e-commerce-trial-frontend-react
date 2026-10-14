import { apiRequest } from '../lib/api';
import { Product } from '../types';
import { CATALOG_PAGE_SIZE } from '../config';

export interface Category {
  id: number | string;
  name: string;
  slug: string;
}

export interface ProductFilters {
  category?: string;
  gender?: 'men' | 'women' | 'unisex';
  search?: string;
  featured?: boolean;
  in_stock?: boolean;
  per_page?: number;
  on_sale?: boolean;
  min_discount?: number;
}

interface ListResponse {
  data: Product[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    max_discount?: number | null;
  };
}

const normalize = (p: Product): Product => {
  const priceEUR = Number(p.priceEUR ?? p.price ?? 0);
  const compareAt = p.compareAtPriceEUR;
  return {
    ...p,
    id: String(p.id),
    priceEUR,
    price: Number(p.price ?? priceEUR),
    onSale: Boolean(p.onSale),
    discountPercent: p.discountPercent == null ? null : Number(p.discountPercent),
    compareAtPriceEUR: compareAt == null ? null : Number(compareAt),
    saleEndsAt: p.saleEndsAt ?? null,
  };
};

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const res = await apiRequest<ListResponse>('/catalog/products', {
    query: { per_page: CATALOG_PAGE_SIZE, ...filters },
    auth: false,
  });
  return res.data.map(normalize);
}

export interface SaleProducts {
  products: Product[];
  maxDiscount: number | null;
}

/** Regular (non flash) on-sale products; `minDiscount` 1-90 filters by discount percent. */
export async function getSaleProducts(minDiscount?: number): Promise<SaleProducts> {
  const res = await apiRequest<ListResponse>('/catalog/products', {
    query: {
      per_page: CATALOG_PAGE_SIZE,
      on_sale: 1,
      ...(minDiscount ? { min_discount: minDiscount } : {}),
    },
    auth: false,
  });
  const max = res.meta?.max_discount;
  return { products: res.data.map(normalize), maxDiscount: max == null ? null : Number(max) };
}

export async function getProduct(slug: string): Promise<Product> {
  const res = await apiRequest<{ data: Product }>(`/catalog/products/${encodeURIComponent(slug)}`, {
    auth: false,
  });
  return normalize(res.data);
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiRequest<{ data: Category[] }>('/catalog/categories', { auth: false });
  return res.data;
}
