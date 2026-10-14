import { http, HttpResponse } from 'msw';
import type { FlashSale, FlashSaleListResponse, Product } from '../types';
import type { Client } from '../services/auth';

export const API = 'http://localhost:8000/api/v1';
export const homeFixture = {
  data: {
    heroEyebrow: 'LARAVEL EYEBROW',
    heroTitle: 'LARAVEL HERO\nTITLE',
    heroSubtitle: 'LARAVEL hero subtitle.',
    lookbook: [
      {
        id: 11,
        title: 'LARAVEL LOOK ONE',
        caption: 'LARAVEL CAPTION',
        link: 'https://example.com/look',
        imageUrl: 'https://cdn.test/look1.jpg',
      },
      { id: 12, title: 'LARAVEL LOOK TWO', caption: '', link: '', imageUrl: null },
    ],
    editorialTitle: 'LARAVEL EDITORIAL TITLE',
    editorialBody: 'LARAVEL editorial body.',
    editorialImageUrl: 'https://cdn.test/editorial.jpg',
  },
};

export const settingsFixture = {
  data: {
    announcement: 'LARAVEL ANNOUNCEMENT',
    footerTagline: 'LARAVEL FOOTER TAGLINE',
    socialLinks: [{ label: 'MASTODON', icon: 'forum', href: 'https://mastodon.example/kraft' }],
    storeLocations: [{ name: 'PARIS MARAIS', address: 'RUE DE BRETAGNE 1', hours: 'OPEN 10-19' }],
  },
};

export const makeArticle = (over: Record<string, unknown> = {}) => ({
  id: 1,
  slug: 'on-raw-denim',
  title: 'ON RAW DENIM',
  excerpt: 'Why raw denim ages better.',
  coverImage: 'https://cdn.test/denim.jpg',
  coverImageAlt: 'Folded raw denim',
  author: 'L. Vandervoort',
  category: 'Essay',
  isFeatured: false,
  publishedAt: '2026-03-04T10:00:00Z',
  updatedAt: '2026-03-05T10:00:00Z',
  readingMinutes: 4,
  seoTitle: null,
  seoDescription: null,
  ...over,
});

export const articleSummaries = [
  makeArticle({ id: 1, slug: 'on-raw-denim', title: 'ON RAW DENIM' }),
  makeArticle({ id: 2, slug: 'the-rail-system', title: 'THE RAIL SYSTEM', category: 'Interview', isFeatured: true, author: 'A. Moreau' }),
  makeArticle({ id: 3, slug: 'no-cover-story', title: 'NO COVER STORY', coverImage: null, coverImageAlt: '', category: null }),
];

export const articleBody = [
  '# Body Title',
  '',
  'Intro with an [external link](https://example.com/x) and an [internal link](/shop).',
  '',
  '## Materials',
  '',
  '- Cotton',
  '- Wool',
  '',
  '> A quote',
  '',
  '<script>window.__pwned = true</script>',
  '',
  '<div class="raw-html">RAW HTML</div>',
].join('\n');

export const TEST_TOKEN = 'test-token-123';

export const makeProduct = (over: Partial<Product> = {}): Product => ({
  id: '1',
  slug: 'raw-denim-jacket',
  title: 'RAW DENIM JACKET',
  code: 'KFT-001',
  category: 'OUTERWEAR',
  gender: 'men',
  priceEUR: 250,
  price: 250,
  substrate: 'RAW SELVEDGE DENIM (14OZ)',
  colorway: 'CARBON BLACK',
  colorHexList: ['#111111'],
  sizes: ['S', 'M', 'L'],
  inStock: true,
  image: 'https://img.test/jacket.jpg',
  description: 'A jacket.',
  sku: 'SKU-001',
  specs: {},
  headline: null,
  longDescription: null,
  careInstructions: null,
  seoTitle: null,
  seoDescription: null,
  ...over,
});

export const products: Product[] = [
  makeProduct({
    headline: 'BUILT FOR WEATHER',
    longDescription: 'Long form story about the jacket.',
    careInstructions: 'Spot clean only.',
    seoTitle: 'Raw Denim Jacket | KRAFT',
    seoDescription: 'Heavyweight selvedge denim jacket.',
  }),
  makeProduct({ id: '2', slug: 'wool-coat', title: 'WOOL COAT', code: 'KFT-002', sku: 'SKU-002', gender: 'women', priceEUR: 300, price: 300 }),
  makeProduct({ id: '3', slug: 'linen-shirt', title: 'LINEN SHIRT', code: 'KFT-003', sku: 'SKU-003', gender: 'women', category: 'SHIRTS', priceEUR: 90, price: 90 }),
];

export const saleProducts: Product[] = [
  makeProduct({ id: '11', slug: 'sale-parka', title: 'SALE PARKA', code: 'KFT-011', priceEUR: 150, price: 150, onSale: true, discountPercent: 40, compareAtPriceEUR: 250, saleEndsAt: null }),
  makeProduct({ id: '12', slug: 'sale-tee', title: 'SALE TEE', code: 'KFT-012', priceEUR: 40, price: 40, onSale: true, discountPercent: 20, compareAtPriceEUR: 50, saleEndsAt: null }),
  makeProduct({ id: '13', slug: 'sale-boots', title: 'SALE BOOTS', code: 'KFT-013', priceEUR: 100, price: 100, onSale: true, discountPercent: 50, compareAtPriceEUR: 200, saleEndsAt: null }),
];

export const categories = [
  { id: 1, name: 'Outerwear', slug: 'outerwear' },
  { id: 2, name: 'Shirts', slug: 'shirts' },
];

export const makeClient = (over: Partial<Client> = {}): Client => ({
  id: 7,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  first_name: 'Ada',
  last_name: 'Lovelace',
  phone: null,
  ...over,
});

export const makeFlashSale = (over: Partial<FlashSale> = {}): FlashSale => ({
  id: 'fs-1',
  status: 'active',
  startsAt: '2030-01-01T00:00:00Z',
  endsAt: '2030-01-01T06:00:00Z',
  salePrice: 100,
  originalPrice: 200,
  currency: 'EUR',
  discountPercent: 50,
  totalStock: 10,
  availableStock: 5,
  depletionPercent: 50,
  stockState: 'ok',
  product: {
    id: '1',
    slug: 'raw-denim-jacket',
    title: 'RAW DENIM JACKET',
    code: 'KFT-001',
    category: 'OUTERWEAR',
    image: 'https://img.test/jacket.jpg',
    sizes: ['S', 'M'],
    sku: 'SKU-001',
  },
  ...over,
});

export const flashSalesResponse = (
  data: FlashSale[] = [makeFlashSale()],
  meta: Partial<FlashSaleListResponse['meta']> = {},
): FlashSaleListResponse => ({
  data,
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: data.length,
    nextEndsAt: '2030-01-01T06:00:00Z',
    serverTime: '2030-01-01T00:00:00Z',
    tiers: { all: data.length, '40': 0, '50': data.length, '60': 0 },
    categories: [{ name: 'Outerwear', slug: 'outerwear', count: data.length }],
    ...meta,
  },
});

export const validationError = (errors: Record<string, string[]>, message = 'The given data was invalid.') =>
  HttpResponse.json({ message, errors }, { status: 422 });

const authed = (request: Request) => request.headers.get('Authorization') === `Bearer ${TEST_TOKEN}`;
const unauthenticated = () => HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

/** Default happy-path handlers. Override per test with `server.use(...)`. */
export const handlers = [
  http.get(`${API}/content/home`, () => HttpResponse.json(homeFixture)),
  http.get(`${API}/content/site-settings`, () => HttpResponse.json(settingsFixture)),
  http.get(`${API}/content/articles`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const data = category ? articleSummaries.filter((a) => a.category === category) : articleSummaries;
    return HttpResponse.json({
      data,
      meta: { current_page: Number(url.searchParams.get('page') ?? 1), last_page: 1, per_page: 9, total: data.length },
      categories: ['Essay', 'Interview'],
    });
  }),
  http.get(`${API}/content/articles/:slug/preview`, ({ params, request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('signature') !== 'valid-sig') {
      return HttpResponse.json({ message: 'Invalid signature.' }, { status: 403 });
    }
    const found = articleSummaries.find((a) => a.slug === params.slug);
    if (!found) return HttpResponse.json({ message: 'Not found.' }, { status: 404 });
    return HttpResponse.json({
      data: { ...found, body: articleBody },
      related: [],
      preview: { status: 'draft' },
    });
  }),
  http.get(`${API}/content/articles/:slug`, ({ params }) => {
    const found = articleSummaries.find((a) => a.slug === params.slug);
    if (!found) return HttpResponse.json({ message: 'Not found.' }, { status: 404 });
    return HttpResponse.json({
      data: { ...found, body: articleBody },
      related: articleSummaries.filter((a) => a.slug !== found.slug).slice(0, 2),
    });
  }),
  http.get(`${API}/catalog/products`, ({ request }) => {
    const sp = new URL(request.url).searchParams;
    if (sp.get('on_sale') || sp.get('min_discount')) {
      const min = Number(sp.get('min_discount') ?? 0);
      const data = saleProducts.filter((p) => (p.discountPercent ?? 0) >= min);
      const max = saleProducts.reduce((m, p) => Math.max(m, p.discountPercent ?? 0), 0) || null;
      return HttpResponse.json({ data, meta: { current_page: 1, last_page: 1, per_page: 100, total: data.length, max_discount: max } });
    }
    const gender = sp.get('gender');
    const data = gender ? products.filter((p) => p.gender === gender) : products;
    return HttpResponse.json({ data, meta: { current_page: 1, last_page: 1, per_page: 100, total: data.length } });
  }),
  http.get(`${API}/catalog/products/:slug`, ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    return product
      ? HttpResponse.json({ data: product })
      : HttpResponse.json({ message: 'Not found.' }, { status: 404 });
  }),
  http.get(`${API}/catalog/categories`, () => HttpResponse.json({ data: categories })),
  http.get(`${API}/catalog/flash-sales`, () => HttpResponse.json(flashSalesResponse())),
  http.post(`${API}/client/flash-sales/:id/reserve`, ({ request }) =>
    authed(request)
      ? HttpResponse.json({ status: 'reserved', message: 'Reserved.', reservation: { id: 'r1', status: 'active', expires_at: '2030-01-01T00:15:00Z' } })
      : unauthenticated(),
  ),
  http.post(`${API}/newsletter/flash-drops`, async ({ request }) => {
    const { email } = (await request.json()) as { email?: string };
    if (!email || !email.includes('@')) return validationError({ email: ['The email must be valid.'] });
    return HttpResponse.json({ message: 'Subscribed.', subscribed: true }, { status: 201 });
  }),
  http.post(`${API}/client/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };
    if (password !== 'password123') {
      return HttpResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    return HttpResponse.json({ message: 'Logged in.', token: TEST_TOKEN, client: makeClient({ email }) });
  }),
  http.post(`${API}/client/register`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (body.email === 'taken@example.com') {
      return validationError({ email: ['The email has already been taken.'] });
    }
    return HttpResponse.json(
      {
        message: 'Registered.',
        token: TEST_TOKEN,
        client: makeClient({ email: body.email, first_name: body.first_name, last_name: body.last_name, name: `${body.first_name} ${body.last_name}` }),
      },
      { status: 201 },
    );
  }),
  http.get(`${API}/client/me`, ({ request }) => (authed(request) ? HttpResponse.json({ client: makeClient() }) : unauthenticated())),
  http.post(`${API}/client/logout`, () => HttpResponse.json({ message: 'Logged out.' })),
  http.post(`${API}/client/orders`, async ({ request }) => {
    if (!authed(request)) return unauthenticated();
    const body = (await request.json()) as { items: { quantity: number }[]; deliveryMethod: string };
    return HttpResponse.json(
      {
        data: {
          orderNumber: 'KFT-0001',
          status: 'pending',
          subtotal: 250,
          deliveryCost: body.deliveryMethod === 'standard' ? 0 : 15,
          discount: 0,
          total: 250,
          items: body.items,
          createdAt: '2030-01-01T00:00:00Z',
        },
      },
      { status: 201 },
    );
  }),
  http.get(`${API}/client/orders`, ({ request }) => (authed(request) ? HttpResponse.json({ data: [] }) : unauthenticated())),
  http.get(`${API}/client/orders/:orderNumber`, ({ request, params }) => {
    if (!authed(request)) return unauthenticated();
    return params.orderNumber === 'KFT-0001'
      ? HttpResponse.json({ data: { orderNumber: 'KFT-0001', status: 'pending', subtotal: 250, deliveryCost: 0, discount: 0, total: 250, items: [], createdAt: '2030-01-01T00:00:00Z' } })
      : HttpResponse.json({ message: 'Not found.' }, { status: 404 });
  }),
];
