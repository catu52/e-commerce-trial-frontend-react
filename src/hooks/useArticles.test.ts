import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API } from '../test/handlers';
import { act, renderHook, waitFor } from '../test/utils';
import { useArticles } from './useArticles';
import { useArticle } from './useArticle';

describe('useArticles', () => {
  it('loads articles and refetches when the category changes', async () => {
    const { result, rerender } = renderHook((p: { category?: string }) => useArticles(p), { initialProps: {} });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.articles).toHaveLength(3));
    rerender({ category: 'Interview' });
    await waitFor(() => expect(result.current.articles).toHaveLength(1));
    expect(result.current.categories).toEqual(['Essay', 'Interview']);
  });

  it('reports errors and recovers on reload', async () => {
    server.use(http.get(`${API}/content/articles`, () => HttpResponse.json({ message: 'boom' }, { status: 500 }), { once: true }));
    const { result } = renderHook(() => useArticles());
    await waitFor(() => expect(result.current.error).toBe('boom'));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.articles).toHaveLength(3));
    expect(result.current.error).toBeNull();
  });
});

describe('useArticle', () => {
  it('goes loading -> found', async () => {
    const { result } = renderHook(() => useArticle('on-raw-denim'));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('found'));
  });

  it('returns not-found for 404 and error otherwise', async () => {
    const nf = renderHook(() => useArticle('nope'));
    await waitFor(() => expect(nf.result.current.status).toBe('not-found'));
    server.use(http.get(`${API}/content/articles/:slug`, () => HttpResponse.json({ message: 'down' }, { status: 500 })));
    const err = renderHook(() => useArticle('on-raw-denim'));
    await waitFor(() => expect(err.result.current).toEqual({ status: 'error', message: 'down' }));
  });

  it('does not resolve a stale slug after it changes', async () => {
    const { result, rerender } = renderHook(({ s }) => useArticle(s), { initialProps: { s: 'on-raw-denim' } });
    rerender({ s: 'nope' });
    await waitFor(() => expect(result.current.status).toBe('not-found'));
  });
});
