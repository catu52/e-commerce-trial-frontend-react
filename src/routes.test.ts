import { ROUTES, pathForPage, resolveRoute } from './routes';

const nf = { page: 'not-found', section: 'all' };

describe('resolveRoute', () => {
  it.each<[string, unknown]>([
    ['/', { page: 'home', section: 'all' }],
    ['', { page: 'home', section: 'all' }],
    ['/shop', { page: 'catalog', section: 'all' }],
    ['/shop/', { page: 'catalog', section: 'all' }],
    ['/shop/men', { page: 'catalog', section: 'men' }],
    ['/shop/women/', { page: 'catalog', section: 'women' }],
    ['/sale', { page: 'sale', section: 'all' }],
    ['/sale/', { page: 'sale', section: 'all' }],
    ['/flash-sale', { page: 'flash-sale', section: 'all' }],
    ['/flash-sale/', { page: 'flash-sale', section: 'all' }],
    ['/checkout/information', { page: 'checkout-1', section: 'all' }],
    ['/checkout/payment/', { page: 'checkout-2', section: 'all' }],
    ['/checkout/confirmation', { page: 'checkout-3', section: 'all' }],
    ['/products/some-slug', { page: 'pdp', section: 'all', slug: 'some-slug' }],
    ['/products/some-slug/', { page: 'pdp', section: 'all', slug: 'some-slug' }],
    ['/products/a%20b', { page: 'pdp', section: 'all', slug: 'a b' }],
    ['/products/a%E2%82%ACb', { page: 'pdp', section: 'all', slug: 'a€b' }],
  ])('%s', (path, expected) => {
    expect(resolveRoute(path)).toEqual(expected);
  });

  it.each([
    '/shop/kids',
    '/shop/men/extra',
    '/products',
    '/products/',
    '/products/%E0%A4%A',
    '/products/a/b',
    '/checkout',
    '/checkout/foo',
    '/checkout/payment/extra',
    '/flash-sale/x',
    '/sale/x',
    '/nonsense',
    '/Shop',
  ])('%s is not found', (path) => {
    expect(resolveRoute(path)).toEqual(nf);
  });
});

describe('ROUTES', () => {
  it('has static paths', () => {
    expect(ROUTES.home).toBe('/');
    expect(ROUTES.shop).toBe('/shop');
    expect(ROUTES.flashSale).toBe('/flash-sale');
    expect(ROUTES.checkoutInformation).toBe('/checkout/information');
    expect(ROUTES.checkoutPayment).toBe('/checkout/payment');
    expect(ROUTES.checkoutConfirmation).toBe('/checkout/confirmation');
  });

  it('builds section paths', () => {
    expect(ROUTES.shopSection('all')).toBe('/shop');
    expect(ROUTES.shopSection('men')).toBe('/shop/men');
    expect(ROUTES.shopSection('women')).toBe('/shop/women');
  });

  it('encodes product slugs and round-trips through resolveRoute', () => {
    expect(ROUTES.product('raw-denim-jacket')).toBe('/products/raw-denim-jacket');
    expect(ROUTES.product('a b/€')).toBe('/products/a%20b%2F%E2%82%AC');
    for (const slug of ['a b', 'x/y', '€', 'plain']) {
      expect(resolveRoute(ROUTES.product(slug))).toEqual({ page: 'pdp', section: 'all', slug });
    }
  });
});

describe('pathForPage', () => {
  it.each([
    ['home', '/'],
    ['catalog', '/shop'],
    ['flash-sale', '/flash-sale'],
    ['sale', '/sale'],
    ['checkout-1', '/checkout/information'],
    ['checkout-2', '/checkout/payment'],
    ['checkout-3', '/checkout/confirmation'],
  ] as const)('%s -> %s', (page, path) => {
    expect(pathForPage(page)).toBe(path);
  });
});

describe('editorial routes', () => {
  it('builds and resolves editorial paths', () => {
    expect(ROUTES.editorial).toBe('/editorial');
    expect(ROUTES.article('a b')).toBe('/editorial/a%20b');
    expect(pathForPage('editorial')).toBe('/editorial');
    expect(resolveRoute('/editorial')).toEqual({ page: 'editorial', section: 'all' });
    expect(resolveRoute('/editorial/')).toEqual({ page: 'editorial', section: 'all' });
    expect(resolveRoute('/editorial/a%20b')).toEqual({ page: 'article', section: 'all', slug: 'a b' });
    expect(resolveRoute('/editorial/%E0%A4%A')).toEqual({ page: 'not-found', section: 'all' });
    expect(resolveRoute('/editorial/a/b')).toEqual({ page: 'not-found', section: 'all' });
  });
});
