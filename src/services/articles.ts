import { apiRequest } from '../lib/api';
import { CONTENT_TIMEOUT_MS } from '../config';
import type { Article, ArticleDetail, PreviewCredentials, ArticlesPage, ArticlesParams, ArticleSummary } from '../types';

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null);
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

export function mapArticleSummary(raw: unknown): ArticleSummary | null {
  if (!isObj(raw)) return null;
  const slug = str(raw.slug);
  const title = str(raw.title);
  if (!slug || !title) return null;
  return {
    id: String(raw.id ?? slug),
    slug,
    title,
    excerpt: str(raw.excerpt) ?? '',
    coverImage: str(raw.coverImage),
    coverImageAlt: str(raw.coverImageAlt) ?? title,
    author: str(raw.author) ?? '',
    category: str(raw.category),
    isFeatured: raw.isFeatured === true,
    publishedAt: str(raw.publishedAt) ?? '',
    updatedAt: str(raw.updatedAt) ?? str(raw.publishedAt) ?? '',
    readingMinutes: Math.max(1, Math.round(num(raw.readingMinutes, 1))),
    seoTitle: str(raw.seoTitle),
    seoDescription: str(raw.seoDescription),
  };
}

const mapList = (raw: unknown): ArticleSummary[] =>
  Array.isArray(raw) ? raw.flatMap((a) => mapArticleSummary(a) ?? []) : [];

export async function getArticles(params: ArticlesParams = {}): Promise<ArticlesPage> {
  const res = await apiRequest<unknown>('/content/articles', {
    auth: false,
    timeoutMs: CONTENT_TIMEOUT_MS,
    query: { page: params.page, per_page: params.perPage, category: params.category },
  });
  const body = isObj(res) ? res : {};
  const meta = isObj(body.meta) ? body.meta : {};
  const articles = mapList(body.data);
  return {
    articles,
    meta: {
      currentPage: num(meta.current_page, 1),
      lastPage: Math.max(1, num(meta.last_page, 1)),
      perPage: num(meta.per_page, articles.length),
      total: num(meta.total, articles.length),
    },
    categories: Array.isArray(body.categories) ? body.categories.filter((c): c is string => typeof c === 'string') : [],
  };
}

export async function getArticle(slug: string, preview?: PreviewCredentials): Promise<ArticleDetail> {
  const base = `/content/articles/${encodeURIComponent(slug)}`;
  const res = await apiRequest<unknown>(preview ? `${base}/preview` : base, {
    auth: false,
    timeoutMs: CONTENT_TIMEOUT_MS,
    query: preview ? { expires: preview.expires, signature: preview.signature } : undefined,
  });
  const body = isObj(res) ? res : {};
  const summary = mapArticleSummary(body.data);
  if (!summary) throw new Error('Malformed article response.');
  const data = body.data as Raw;
  const article: Article = { ...summary, body: typeof data.body === 'string' ? data.body : '' };
  const status = isObj(body.preview) ? body.preview.status : undefined;
  const previewStatus = status === 'draft' || status === 'scheduled' || status === 'published' ? status : undefined;
  return { article, related: mapList(body.related), ...(preview ? { previewStatus } : {}) };
}
