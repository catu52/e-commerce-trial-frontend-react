import { rejection } from '../test/utils';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, categories, makeProduct, products } from '../test/handlers';
import { ApiError } from '../lib/api';
import { getCategories, getProduct, getProducts } from './catalog';

describe('catalog service', () => {
  it('getProducts requests per_page=100 and returns all products', async () => {
    let search = '';
    server.use(
      http.get(`${API}/catalog/products`, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({ data: products });
      }),
    );
    const list = await getProducts();
    expect(list).toHaveLength(products.length);
    expect(new URLSearchParams(search).get('per_page')).toBe('100');
  });

  it('forwards filters (gender, search) as query params', async () => {
    let params!: URLSearchParams;
    server.use(
      http.get(`${API}/catalog/products`, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ data: [] });
      }),
    );
    await getProducts({ gender: 'women', search: 'coat', in_stock: true });
    expect(params.get('gender')).toBe('women');
    expect(params.get('search')).toBe('coat');
    expect(params.get('in_stock')).toBe('true');
  });

  it('normalizes ids to strings and prices to numbers', async () => {
    server.use(
      http.get(`${API}/catalog/products`, () =>
        HttpResponse.json({
          data: [
            { ...makeProduct(), id: 42, priceEUR: '199.50', price: '199.50' },
            { ...makeProduct({ id: '43' }), priceEUR: undefined, price: '10' },
            { ...makeProduct({ id: '44' }), priceEUR: undefined, price: undefined },
          ],
        }),
      ),
    );
    const [a, b, c] = await getProducts();
    expect(a.id).toBe('42');
    expect(a.priceEUR).toBe(199.5);
    expect(b.priceEUR).toBe(10);
    expect(c.priceEUR).toBe(0);
    expect(c.price).toBe(0);
  });

  it('getProduct fetches by slug and url-encodes it', async () => {
    const product = await getProduct('wool-coat');
    expect(product.title).toBe('WOOL COAT');

    let url = '';
    server.use(
      http.get(`${API}/catalog/products/:slug`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: makeProduct() });
      }),
    );
    await getProduct('a/b c');
    expect(url).toContain('/catalog/products/a%2Fb%20c');
  });

  it('getProduct rejects with a 404 ApiError for unknown slugs', async () => {
    const err = await rejection(getProduct('nope'));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
  });

  it('getCategories returns the data array', async () => {
    await expect(getCategories()).resolves.toEqual(categories);
  });
});
