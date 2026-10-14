import { rejection } from '../test/utils';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, TEST_TOKEN, flashSalesResponse } from '../test/handlers';
import { setToken } from '../lib/api';
import { getFlashSales, reserveFlashSale, subscribeFlashDrops } from './flashSales';

describe('flashSales service', () => {
  it('getFlashSales maps filters to query params (perPage -> per_page) and omits empties', async () => {
    let params!: URLSearchParams;
    server.use(
      http.get(`${API}/catalog/flash-sales`, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json(flashSalesResponse());
      }),
    );
    await getFlashSales({ tier: '50', category: '', size: 'M', sort: 'price_asc', page: 2, perPage: 8 });
    expect(Object.fromEntries(params)).toEqual({ tier: '50', size: 'M', sort: 'price_asc', page: '2', per_page: '8' });
  });

  it('getFlashSales with no args sends no query and returns data+meta', async () => {
    let search = 'x';
    server.use(
      http.get(`${API}/catalog/flash-sales`, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json(flashSalesResponse());
      }),
    );
    const res = await getFlashSales();
    expect(search).toBe('');
    expect(res.data).toHaveLength(1);
    expect(res.meta.serverTime).toBeDefined();
  });

  it('reserveFlashSale posts with the bearer token and encodes the id', async () => {
    setToken(TEST_TOKEN);
    let url = '';
    server.use(
      http.post(`${API}/client/flash-sales/:id/reserve`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ status: 'reserved', message: 'ok' });
      }),
    );
    await expect(reserveFlashSale('a/b')).resolves.toMatchObject({ status: 'reserved' });
    expect(url).toContain('/flash-sales/a%2Fb/reserve');
  });

  it('reserveFlashSale rejects with 401 when logged out', async () => {
    await expect(reserveFlashSale('fs-1')).rejects.toMatchObject({ status: 401 });
  });

  it('reserveFlashSale surfaces a sold-out conflict', async () => {
    setToken(TEST_TOKEN);
    server.use(
      http.post(`${API}/client/flash-sales/:id/reserve`, () =>
        HttpResponse.json({ message: 'Sold out.' }, { status: 409 }),
      ),
    );
    await expect(reserveFlashSale('fs-1')).rejects.toMatchObject({ status: 409, message: 'Sold out.' });
  });

  it('subscribeFlashDrops succeeds and rejects invalid email with field errors', async () => {
    await expect(subscribeFlashDrops('a@b.c')).resolves.toEqual({ message: 'Subscribed.', subscribed: true });
    const err = await rejection(subscribeFlashDrops('nope'));
    expect(err.status).toBe(422);
    expect(err.errors.email).toBeDefined();
  });
});
