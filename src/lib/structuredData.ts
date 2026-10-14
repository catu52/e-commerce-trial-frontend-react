import { SITE_URL } from '../config';
import { ROUTES } from '../routes';
import type { Article, Currency, Product } from '../types';
import { absoluteUrl, SITE_NAME } from './seo';

type JsonLd = Record<string, unknown>;

export function organizationLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function websiteLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productLd(product: Product, currency: Currency = 'EUR'): JsonLd {
  const images = [product.image, ...(product.galleryImages ?? [])]
    .filter(Boolean)
    .filter((img, i, all) => all.indexOf(img) === i)
    .map(absoluteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.sku || product.code,
    mpn: product.code,
    image: images,
    description: product.description,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      price: product.priceEUR.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${product.inStock ? 'InStock' : 'OutOfStock'}`,
      url: `${SITE_URL}${ROUTES.product(product.slug)}`,
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListLd(products: Product[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.title,
      url: `${SITE_URL}${ROUTES.product(p.slug)}`,
      image: absoluteUrl(p.image),
    })),
  };
}

export function articleLd(article: Article): JsonLd {
  const url = `${SITE_URL}${ROUTES.article(article.slug)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    ...(article.coverImage ? { image: [absoluteUrl(article.coverImage)] } : {}),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: article.author
      ? { '@type': 'Person', name: article.author }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}
