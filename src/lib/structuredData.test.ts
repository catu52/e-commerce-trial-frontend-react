import { describe, expect, it } from 'vitest';
import { SITE_URL } from '../config';
import type { Product } from '../types';
import { articleLd, breadcrumbLd, itemListLd, organizationLd, productLd, websiteLd } from './structuredData';

const product = {
  id: '1',
  slug: 'coat one',
  title: 'Coat',
  code: 'C-1',
  sku: 'SKU-1',
  priceEUR: 120,
  image: '/a.png',
  galleryImages: ['/a.png', 'https://cdn.test/b.png'],
  description: 'Warm coat',
  inStock: true,
} as unknown as Product;

describe('structuredData', () => {
  it('builds organization and website with search action', () => {
    expect(organizationLd()).toMatchObject({ '@type': 'Organization', url: SITE_URL });
    const site = websiteLd() as any;
    expect(site['@type']).toBe('WebSite');
    expect(site.potentialAction.target.urlTemplate).toBe(`${SITE_URL}/shop?q={search_term_string}`);
  });

  it('builds product with offer', () => {
    const ld = productLd(product) as any;
    expect(ld['@type']).toBe('Product');
    expect(ld.name).toBe('Coat');
    expect(ld.sku).toBe('SKU-1');
    expect(ld.image).toEqual([`${SITE_URL}/a.png`, 'https://cdn.test/b.png']);
    expect(ld.offers).toMatchObject({
      price: '120.00',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/products/coat%20one`,
    });
  });

  it('marks out of stock and custom currency', () => {
    const ld = productLd({ ...product, inStock: false }, 'USD') as any;
    expect(ld.offers.availability).toBe('https://schema.org/OutOfStock');
    expect(ld.offers.priceCurrency).toBe('USD');
  });

  it('builds breadcrumb and item list', () => {
    const b = breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]) as any;
    expect(b.itemListElement[1]).toMatchObject({ position: 2, name: 'Shop', item: `${SITE_URL}/shop` });
    const l = itemListLd([product]) as any;
    expect(l['@type']).toBe('ItemList');
    expect(l.itemListElement[0]).toMatchObject({ position: 1, url: `${SITE_URL}/products/coat%20one` });
  });
});

describe('articleLd', () => {
  const article = {
    id: '1', slug: 'on-denim', title: 'On Denim', excerpt: 'Short', body: 'x', coverImage: '/c.jpg', coverImageAlt: 'c',
    author: 'Ann', category: null, isFeatured: false, publishedAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
    readingMinutes: 3, seoTitle: null, seoDescription: 'Seo desc',
  };

  it('builds an Article', () => {
    expect(articleLd(article)).toMatchObject({
      '@type': 'Article',
      headline: 'On Denim',
      description: 'Seo desc',
      image: [`${SITE_URL}/c.jpg`],
      datePublished: '2026-01-01T00:00:00Z',
      dateModified: '2026-01-02T00:00:00Z',
      author: { '@type': 'Person', name: 'Ann' },
      publisher: { '@type': 'Organization' },
      mainEntityOfPage: { '@id': `${SITE_URL}/editorial/on-denim` },
    });
  });

  it('omits image and falls back to an organization author', () => {
    const ld = articleLd({ ...article, coverImage: null, author: '' });
    expect(ld).not.toHaveProperty('image');
    expect(ld.author).toMatchObject({ '@type': 'Organization' });
  });
});
