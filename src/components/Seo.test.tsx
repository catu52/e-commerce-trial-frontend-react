import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SITE_URL } from '../config';
import { Seo } from './Seo';

const q = (s: string) => document.head.querySelectorAll(s);
const content = (s: string) => document.head.querySelector(s)?.getAttribute('content');

describe('Seo', () => {
  beforeEach(() => {
    document.title = 'Original';
  });
  afterEach(() => {
    document.head.querySelectorAll('meta[name="description"], link[rel="canonical"], script[data-seo]').forEach((e) => e.remove());
  });

  it('sets title, description, canonical, og, twitter, robots and json-ld', () => {
    render(
      <Seo
        title="Shop"
        description="A description"
        path="/shop/?q=1#x"
        image="/img.png"
        type="product"
        jsonLd={{ '@type': 'Thing' }}
      />,
    );
    expect(document.title).toBe('Shop — KRAFT Studio');
    expect(content('meta[name="description"]')).toBe('A description');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/shop`);
    expect(content('meta[property="og:title"]')).toBe('Shop — KRAFT Studio');
    expect(content('meta[property="og:type"]')).toBe('product');
    expect(content('meta[property="og:url"]')).toBe(`${SITE_URL}/shop`);
    expect(content('meta[property="og:image"]')).toBe(`${SITE_URL}/img.png`);
    expect(content('meta[property="og:site_name"]')).toBe('KRAFT Studio');
    expect(content('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(content('meta[name="robots"]')).toBe('index,follow');
    expect(JSON.parse(document.head.querySelector('script[data-seo]')!.textContent!)).toEqual({ '@type': 'Thing' });
  });

  it('does not duplicate the brand, uses root canonical with slash and truncates', () => {
    render(<Seo title="KRAFT Studio — Home" description={'x'.repeat(300)} path="/" noindex />);
    expect(document.title).toBe('KRAFT Studio — Home');
    expect(content('meta[name="description"]')!.length).toBeLessThanOrEqual(160);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/`);
    expect(content('meta[name="robots"]')).toBe('noindex,nofollow');
  });

  it('uses default title when absent', () => {
    render(<Seo path="/" />);
    expect(document.title).toContain('KRAFT Studio');
  });

  it('updates on rerender without duplicating tags', () => {
    const { rerender } = render(<Seo title="A" path="/a" jsonLd={{ a: 1 }} />);
    rerender(<Seo title="B" path="/b" jsonLd={[{ b: 2 }]} />);
    expect(document.title).toBe('B — KRAFT Studio');
    expect(q('link[rel="canonical"]')).toHaveLength(1);
    expect(q('meta[name="description"]')).toHaveLength(1);
    expect(q('meta[property="og:title"]')).toHaveLength(1);
    expect(q('script[data-seo]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/b`);
    expect(JSON.parse(document.head.querySelector('script[data-seo]')!.textContent!)).toEqual([{ b: 2 }]);
  });

  it('restores state on unmount', () => {
    const existing = document.createElement('meta');
    existing.setAttribute('name', 'description');
    existing.setAttribute('content', 'orig desc');
    document.head.appendChild(existing);
    const { unmount } = render(<Seo title="A" description="new" path="/a" jsonLd={{ a: 1 }} />);
    expect(content('meta[name="description"]')).toBe('new');
    unmount();
    expect(document.title).toBe('Original');
    expect(content('meta[name="description"]')).toBe('orig desc');
    expect(q('link[rel="canonical"]')).toHaveLength(0);
    expect(q('script[data-seo]')).toHaveLength(0);
    expect(q('meta[property="og:title"]')).toHaveLength(0);
  });

  it('supports article type with article meta tags and noindex,follow', () => {
    const { unmount } = render(
      <Seo title="A" path="/editorial/a" type="article" noindex follow article={{ publishedTime: '2026-01-01', modifiedTime: '2026-01-02', author: 'Ann' }} />,
    );
    expect(content('meta[property="og:type"]')).toBe('article');
    expect(content('meta[property="article:published_time"]')).toBe('2026-01-01');
    expect(content('meta[property="article:modified_time"]')).toBe('2026-01-02');
    expect(content('meta[property="article:author"]')).toBe('Ann');
    expect(content('meta[name="robots"]')).toBe('noindex,follow');
    unmount();
    expect(q('meta[property="article:published_time"]')).toHaveLength(0);
  });
});
