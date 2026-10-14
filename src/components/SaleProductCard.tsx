import React from 'react';
import { Link } from 'react-router-dom';
import type { Currency, Product } from '../types';
import { ROUTES } from '../routes';
import { SaleBadge, SalePrice } from './SalePrice';

export const SaleProductCard: React.FC<{ product: Product; currency: Currency }> = ({ product, currency }) => (
  <article className="group bg-surface-container-lowest border-2 border-primary flex flex-col">
    <Link to={ROUTES.product(product.slug)} className="relative block aspect-[3/4] overflow-hidden bg-surface-container">
      <img
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        src={product.image}
        alt={product.title}
        loading="lazy"
      />
      <SaleBadge product={product} className="absolute top-3 left-3" />
    </Link>
    <div className="p-4 flex justify-between items-start gap-2">
      <div>
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
          {product.code} // {product.category}
        </span>
        <h3 className="font-headline text-sm font-bold uppercase tracking-tight text-primary hover:text-secondary">
          <Link to={ROUTES.product(product.slug)}>{product.title}</Link>
        </h3>
      </div>
      <SalePrice product={product} currency={currency} className="font-mono text-sm font-bold shrink-0 flex-col items-end gap-0" />
    </div>
  </article>
);
