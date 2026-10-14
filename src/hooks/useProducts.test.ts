import { http, HttpResponse } from 'msw';
import { act, renderHook, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { API } from '../test/handlers';
import { useProducts } from './useProducts';

describe('useProducts', () => {
  it('loads all products for section "all"', async () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('sends gender filter for men/women sections and refetches on change', async () => {
    const genders: (string | null)[] = [];
    server.use(
      http.get(`${API}/catalog/products`, ({ request }) => {
        genders.push(new URL(request.url).searchParams.get('gender'));
        return HttpResponse.json({ data: [] });
      }),
    );
    const { rerender } = renderHook(({ s }) => useProducts(s), { initialProps: { s: 'all' as 'all' | 'men' | 'women' } });
    await waitFor(() => expect(genders).toEqual([null]));
    rerender({ s: 'women' });
    await waitFor(() => expect(genders).toEqual([null, 'women']));
  });

  it('exposes the ApiError message on failure', async () => {
    server.use(http.get(`${API}/catalog/products`, () => HttpResponse.json({ message: 'Server exploded' }, { status: 500 })));
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.error).toBe('Server exploded'));
    expect(result.current.loading).toBe(false);
  });

  it('uses a generic message for network errors... via ApiError status 0 message', async () => {
    server.use(http.get(`${API}/catalog/products`, () => HttpResponse.error()));
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.error).toMatch(/unable to reach/i));
  });

  it('reload retries after an error', async () => {
    server.use(http.get(`${API}/catalog/products`, () => HttpResponse.json({ message: 'x' }, { status: 500 }), { once: true }));
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.error).toBe('x'));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.products).toHaveLength(3));
    expect(result.current.error).toBeNull();
  });

  it('ignores a stale response after the section changed', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.get(`${API}/catalog/products`, async ({ request }) => {
        if (new URL(request.url).searchParams.get('gender') === 'men') {
          await gate;
          return HttpResponse.json({ data: [{ id: 'stale', priceEUR: 1 }] });
        }
        return HttpResponse.json({ data: [{ id: 'fresh', priceEUR: 1 }] });
      }),
    );
    const { result, rerender } = renderHook(({ s }) => useProducts(s), { initialProps: { s: 'men' as 'men' | 'women' } });
    rerender({ s: 'women' });
    await waitFor(() => expect(result.current.products[0]?.id).toBe('fresh'));
    release();
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.products[0].id).toBe('fresh');
  });
});
