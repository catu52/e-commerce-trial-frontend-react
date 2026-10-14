import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API } from '../test/handlers';
import { rejection } from '../test/utils';
import { getArticle, getArticles } from './articles';

describe('articles service', () => {
  it('maps the list response, meta and categories', async () => {
    const res = await getArticles({ page: 1, perPage: 9 });
    expect(res.articles).toHaveLength(3);
    expect(res.articles[2].coverImage).toBeNull();
    expect(res.meta).toEqual({ currentPage: 1, lastPage: 1, perPage: 9, total: 3 });
    expect(res.categories).toEqual(['Essay', 'Interview']);
  });

  it('sends page, per_page and category as query params', async () => {
    let url = '';
    server.use(
      http.get(`${API}/content/articles`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: [], meta: {}, categories: [] });
      }),
    );
    await getArticles({ page: 2, perPage: 5, category: 'Essay' });
    const q = new URL(url).searchParams;
    expect([q.get('page'), q.get('per_page'), q.get('category')]).toEqual(['2', '5', 'Essay']);
  });

  it('skips malformed items', async () => {
    server.use(http.get(`${API}/content/articles`, () => HttpResponse.json({ data: [{ nope: 1 }, null], meta: {} })));
    const res = await getArticles();
    expect(res.articles).toEqual([]);
    expect(res.meta.lastPage).toBe(1);
  });

  it('fetches an article with body and related', async () => {
    const { article, related } = await getArticle('on-raw-denim');
    expect(article.title).toBe('ON RAW DENIM');
    expect(article.body).toContain('# Body Title');
    expect(related).toHaveLength(2);
  });

  it('rejects with a 404 ApiError for unknown slugs', async () => {
    expect((await rejection(getArticle('nope'))).status).toBe(404);
  });
});
