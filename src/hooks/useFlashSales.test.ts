import { http, HttpResponse } from 'msw';
import { act, renderHook, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { API, flashSalesResponse, makeFlashSale } from '../test/handlers';
import { FLASH_SALE_DEFAULT_FILTERS } from '../config';
import { useFlashSales } from './useFlashSales';

describe('useFlashSales', () => {
  it('loads the first page', async () => {
    const { result } = renderHook(() => useFlashSales(FLASH_SALE_DEFAULT_FILTERS));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('loadMore appends the next page and de-duplicates by id', async () => {
    const pages: (string | null)[] = [];
    server.use(
      http.get(`${API}/catalog/flash-sales`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        pages.push(page);
        return HttpResponse.json(
          page === '2'
            ? flashSalesResponse([makeFlashSale({ id: 'fs-1' }), makeFlashSale({ id: 'fs-2' })], { current_page: 2, last_page: 2 })
            : flashSalesResponse([makeFlashSale({ id: 'fs-1' })], { current_page: 1, last_page: 2 }),
        );
      }),
    );
    const { result } = renderHook(() => useFlashSales(FLASH_SALE_DEFAULT_FILTERS));
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    await act(() => result.current.loadMore());
    expect(pages).toEqual(['1', '2']);
    expect(result.current.items.map((i) => i.id)).toEqual(['fs-1', 'fs-2']);
    expect(result.current.hasMore).toBe(false);
  });

  it('reports errors on load and on loadMore', async () => {
    server.use(http.get(`${API}/catalog/flash-sales`, () => HttpResponse.json({ message: 'down' }, { status: 503 })));
    const { result } = renderHook(() => useFlashSales(FLASH_SALE_DEFAULT_FILTERS));
    await waitFor(() => expect(result.current.error).toBe('down'));
    await act(() => result.current.loadMore());
    expect(result.current.error).toBe('down');
    expect(result.current.loadingMore).toBe(false);
  });

  it('refetches from page 1 when filters change', async () => {
    const tiers: (string | null)[] = [];
    server.use(
      http.get(`${API}/catalog/flash-sales`, ({ request }) => {
        tiers.push(new URL(request.url).searchParams.get('tier'));
        return HttpResponse.json(flashSalesResponse());
      }),
    );
    const { rerender } = renderHook(({ f }) => useFlashSales(f), { initialProps: { f: FLASH_SALE_DEFAULT_FILTERS } });
    await waitFor(() => expect(tiers).toHaveLength(1));
    rerender({ f: { ...FLASH_SALE_DEFAULT_FILTERS, tier: '60' } });
    await waitFor(() => expect(tiers).toEqual(['all', '60']));
  });

  it('reload keeps the grid visible (no loading flash)', async () => {
    const { result } = renderHook(() => useFlashSales(FLASH_SALE_DEFAULT_FILTERS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.reload());
    expect(result.current.loading).toBe(false);
    expect(result.current.items).toHaveLength(1);
  });
});
