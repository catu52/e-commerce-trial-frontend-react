import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Currency } from '../types';
import { ROUTES } from '../routes';
import { useSaleProducts } from '../hooks/useSaleProducts';
import { parseMinDiscount, parseSaleSort, sortSaleProducts, type SaleSort } from '../lib/sale';
import { breadcrumbLd, itemListLd } from '../lib/structuredData';
import { Seo } from './Seo';
import { SaleFilterBar } from './SaleFilterBar';
import { SaleProductCard } from './SaleProductCard';

export const SaleScreen: React.FC<{ currency: Currency }> = ({ currency }) => {
  const [params, setParams] = useSearchParams();
  const minDiscount = parseMinDiscount(params.get('min_discount'));
  const sort = parseSaleSort(params.get('sort'));
  const { products, maxDiscount, loading, error, reload } = useSaleProducts(minDiscount);

  const update = (key: string, value?: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const sorted = sortSaleProducts(products, sort);
  const headline = maxDiscount ? `Up to ${maxDiscount}% off` : 'Sale';
  const description = maxDiscount
    ? `Shop KRAFT Studio sale: up to ${maxDiscount}% off archive apparel and objects.`
    : 'Shop discounted KRAFT Studio archive apparel and objects.';

  return (
    <div className="flex flex-col w-full bg-background">
      <Seo
        path={ROUTES.sale}
        title="Sale"
        description={description}
        jsonLd={[
          breadcrumbLd([
            { name: 'Home', path: ROUTES.home },
            { name: 'Sale', path: ROUTES.sale },
          ]),
          ...(!loading && !error && !minDiscount && sorted.length ? [itemListLd(sorted)] : []),
        ]}
      />
      <header className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-6 w-full">
        <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Archive sale</span>
        <h1 className="font-headline font-black text-4xl md:text-6xl uppercase tracking-tight text-primary">{headline}</h1>
      </header>
      <SaleFilterBar
        maxDiscount={maxDiscount}
        minDiscount={minDiscount}
        sort={sort}
        onMinDiscountChange={(v) => update('min_discount', v ? String(v) : undefined)}
        onSortChange={(v: SaleSort) => update('sort', v === 'discount' ? undefined : v)}
      />
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
        {loading ? (
          <div role="status" className="py-16 text-center font-mono text-sm uppercase">Loading sale products...</div>
        ) : error ? (
          <div role="alert" className="py-16 text-center font-mono text-sm uppercase space-y-4">
            <div className="text-secondary font-bold">Sale unavailable: {error}</div>
            <button onClick={reload} className="border-2 border-primary bg-primary-container px-4 py-2 font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center font-mono text-sm uppercase text-on-surface-variant">
            No sale products match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map((p) => (
              <SaleProductCard key={p.id} product={p} currency={currency} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
