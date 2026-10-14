import { http, HttpResponse } from 'msw';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { API, flashSalesResponse } from '../test/handlers';
import { useFlashSaleTicker } from './useFlashSaleTicker';

describe('useFlashSaleTicker', () => {
  it('starts null then exposes nextEndsAt and serverTime', async () => {
    const { result } = renderHook(() => useFlashSaleTicker());
    expect(result.current).toEqual({ nextEndsAt: null, serverTime: null });
    await waitFor(() => expect(result.current.nextEndsAt).toBe('2030-01-01T06:00:00Z'));
    expect(result.current.serverTime).toBe('2030-01-01T00:00:00Z');
  });

  it('requests a single-item page', async () => {
    let perPage: string | null = null;
    server.use(
      http.get(`${API}/catalog/flash-sales`, ({ request }) => {
        perPage = new URL(request.url).searchParams.get('per_page');
        return HttpResponse.json(flashSalesResponse());
      }),
    );
    renderHook(() => useFlashSaleTicker());
    await waitFor(() => expect(perPage).toBe('1'));
  });

  it('stays null (and does not throw) when the API fails', async () => {
    let called = false;
    server.use(
      http.get(`${API}/catalog/flash-sales`, () => {
        called = true;
        return HttpResponse.json({ message: 'x' }, { status: 500 });
      }),
    );
    const { result } = renderHook(() => useFlashSaleTicker());
    await waitFor(() => expect(called).toBe(true));
    await new Promise((r) => setTimeout(r, 20));
    expect(result.current).toEqual({ nextEndsAt: null, serverTime: null });
  });

  it('handles a null nextEndsAt (no active sale)', async () => {
    server.use(
      http.get(`${API}/catalog/flash-sales`, () => HttpResponse.json(flashSalesResponse([], { nextEndsAt: null }))),
    );
    const { result } = renderHook(() => useFlashSaleTicker());
    await waitFor(() => expect(result.current.serverTime).not.toBeNull());
    expect(result.current.nextEndsAt).toBeNull();
  });
});
