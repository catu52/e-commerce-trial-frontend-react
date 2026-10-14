import { SITE_URL } from '../config';

export const SITE_NAME = 'KRAFT Studio';
export const DEFAULT_TITLE = 'KRAFT Studio — Bauhaus Neo-Brutalist Apparel Archive';
export const DEFAULT_DESCRIPTION =
  'Bauhaus Neo-Brutalist architectural apparel and object archive featuring geometric utility collections, audited spec catalogs, dispatch bag, and complete checkout protocol.';
export const MAX_DESCRIPTION_LENGTH = 160;

export function formatTitle(title?: string | null): string {
  const t = title?.trim();
  if (!t) return DEFAULT_TITLE;
  if (t.toLowerCase().includes(SITE_NAME.toLowerCase())) return t;
  return `${t} — ${SITE_NAME}`;
}

export function truncateDescription(text?: string | null, max = MAX_DESCRIPTION_LENGTH): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return DEFAULT_DESCRIPTION;
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Absolute canonical URL: no query/hash, no trailing slash except root. */
export function canonicalUrl(path: string = '/'): string {
  const clean = path.split('#')[0].split('?')[0];
  const normalized = `/${clean.replace(/^\/+/, '')}`.replace(/\/+$/, '');
  return `${SITE_URL}${normalized || '/'}`;
}

export function absoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}/${url.replace(/^\/+/, '')}`;
}
