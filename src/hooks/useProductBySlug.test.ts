import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, makeProduct, products } from '../test/handlers';
import { renderHook, waitFor } from '../test/utils';
import { useProductBySlug } from './useProductBySlug';

describe('useProductBySlug', () => {
  it('returns the product from the loaded list without a network call', () => {
    const spy = vi.fn();
    server.use(http.get(`${API}/catalog/products/:slug`, () => { spy(); return HttpResponse.json({}); }));
    const { result } = renderHook(() => useProductBySlug('wool-coat', products));
    expect(result.current).toEqual({ status: 'found', product: products[1] });
    expect(spy).not.toHaveBeenCalled();
  });

  it('fetches when not in the list', async () => {
    const { result } = renderHook(() => useProductBySlug('linen-shirt', []));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('found'));
    expect(result.current.product?.slug).toBe('linen-shirt');
  });

  it('is not-found on 404', async () => {
    const { result } = renderHook(() => useProductBySlug('nope', products));
    await waitFor(() => expect(result.current.status).toBe('not-found'));
  });

  it('is error on 500', async () => {
    server.use(http.get(`${API}/catalog/products/:slug`, () => HttpResponse.json({ message: 'boom' }, { status: 500 })));
    const { result } = renderHook(() => useProductBySlug('nope', []));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current).toHaveProperty('message');
  });

  it('is not-found with an undefined slug', () => {
    const { result } = renderHook(() => useProductBySlug(undefined, products));
    expect(result.current.status).toBe('not-found');
  });

  it('does not show the stale product when the slug changes', async () => {
    const { result, rerender } = renderHook(({ slug }) => useProductBySlug(slug, []), {
      initialProps: { slug: 'wool-coat' },
    });
    await waitFor(() => expect(result.current.product?.slug).toBe('wool-coat'));
    rerender({ slug: 'linen-shirt' });
    expect(result.current.status).toBe('loading');
    expect(result.current.product).toBeUndefined();
    await waitFor(() => expect(result.current.product?.slug).toBe('linen-shirt'));
  });

  it('ignores a slow response for a previous slug', async () => {
    server.use(
      http.get(`${API}/catalog/products/:slug`, async ({ params }) => {
        if (params.slug === 'slow') await new Promise((r) => setTimeout(r, 80));
        return HttpResponse.json({ data: makeProduct({ id: String(params.slug), slug: String(params.slug) }) });
      }),
    );
    const { result, rerender } = renderHook(({ slug }) => useProductBySlug(slug, []), {
      initialProps: { slug: 'slow' },
    });
    rerender({ slug: 'fast' });
    await waitFor(() => expect(result.current.product?.slug).toBe('fast'));
    await new Promise((r) => setTimeout(r, 150));
    expect(result.current.product?.slug).toBe('fast');
  });
});
