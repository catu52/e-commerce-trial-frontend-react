import { rejection } from '../test/utils';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, TEST_TOKEN, makeProduct } from '../test/handlers';
import { setToken } from '../lib/api';
import type { CartItem, CheckoutData } from '../types';
import {
  buildCreateOrderInput,
  createOrder,
  filterOrderableItems,
  getOrder,
  listOrders,
  toDeliveryMethod,
} from './orders';

const item = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'c1',
  productId: '1',
  title: 'T',
  image: 'i',
  priceEUR: 250,
  sku: 'S',
  size: 'M',
  color: 'BLACK',
  quantity: 2,
  ...over,
});

const checkout = (over: Partial<CheckoutData> = {}): CheckoutData => ({
  email: 'a@b.c',
  country: 'Germany',
  firstName: 'Ada',
  lastName: 'L',
  address1: '1 Main St',
  postalCode: '10115',
  city: 'Berlin',
  ...over,
});

describe('toDeliveryMethod', () => {
  it.each([
    [undefined, 'standard'],
    ['standard', 'standard'],
    ['priority', 'express'],
    ['express', 'sameday'],
  ] as const)('%s -> %s', (speed, method) => {
    expect(toDeliveryMethod(speed)).toBe(method);
  });
});

describe('filterOrderableItems', () => {
  it('drops mock complement upsells', () => {
    const cart = [item(), item({ id: 'c2', productId: 'comp-SKU-1' })];
    expect(filterOrderableItems(cart).map((i) => i.id)).toEqual(['c1']);
  });
});

describe('buildCreateOrderInput', () => {
  it('maps cart items to productId/size/color/quantity only', () => {
    const input = buildCreateOrderInput([item({ product: makeProduct() })], checkout());
    expect(input.items).toEqual([{ productId: '1', size: 'M', color: 'BLACK', quantity: 2 }]);
  });

  it('never trusts client-side money: no prices, totals, delivery cost or discount are sent', () => {
    const input = buildCreateOrderInput(
      [item({ priceEUR: 0.01 })],
      checkout({ deliveryCostEUR: 0, discountEUR: 9999, promoCode: 'BAUHAUS10' }),
    );
    const json = JSON.stringify(input);
    expect(json).not.toMatch(/priceEUR|price"|deliveryCost|discount|total/i);
    expect(input.items[0]).not.toHaveProperty('priceEUR');
    expect(input.promoCode).toBe('BAUHAUS10');
  });

  it('does not leak card data to the order payload', () => {
    const input = buildCreateOrderInput([item()], checkout({ cardNumber: '4242', cardCvv: '123', cardName: 'X', cardExpiry: '12/30' }));
    expect(JSON.stringify(input)).not.toMatch(/4242|123|cardNumber|cardCvv/);
  });

  it('excludes complements from the order', () => {
    const input = buildCreateOrderInput([item(), item({ id: 'x', productId: 'comp-9' })], checkout());
    expect(input.items).toHaveLength(1);
  });

  it('prefers address over address1 and falls back to empty string', () => {
    expect(buildCreateOrderInput([item()], checkout({ address: 'A', address1: 'B' })).address).toBe('A');
    expect(buildCreateOrderInput([item()], checkout()).address).toBe('1 Main St');
    expect(buildCreateOrderInput([item()], checkout({ address1: undefined })).address).toBe('');
  });

  it('turns empty optional fields into undefined', () => {
    const input = buildCreateOrderInput([item()], checkout({ apartment: '', phone: '', promoCode: '' }));
    expect(input.apartment).toBeUndefined();
    expect(input.phone).toBeUndefined();
    expect(input.promoCode).toBeUndefined();
  });

  it('defaults payment method to card and delivery to standard; maps dispatch speed', () => {
    const def = buildCreateOrderInput([item()], checkout());
    expect(def.paymentMethod).toBe('card');
    expect(def.deliveryMethod).toBe('standard');
    const fast = buildCreateOrderInput([item()], checkout({ dispatchSpeed: 'express', paymentMethod: 'paypal' }));
    expect(fast.deliveryMethod).toBe('sameday');
    expect(fast.paymentMethod).toBe('paypal');
  });

  it('returns an empty items list for a complements-only cart', () => {
    expect(buildCreateOrderInput([item({ productId: 'comp-1' })], checkout()).items).toEqual([]);
  });
});

describe('orders API', () => {
  beforeEach(() => setToken(TEST_TOKEN));

  it('createOrder posts the input and returns the order', async () => {
    let body: { items: unknown[] } | undefined;
    server.use(
      http.post(`${API}/client/orders`, async ({ request }) => {
        body = (await request.json()) as { items: unknown[] };
        return HttpResponse.json({ data: { orderNumber: 'KFT-9' } }, { status: 201 });
      }),
    );
    const order = await createOrder(buildCreateOrderInput([item()], checkout()));
    expect(order.orderNumber).toBe('KFT-9');
    expect(body?.items).toHaveLength(1);
  });

  it('createOrder requires auth (401) and surfaces validation errors', async () => {
    setToken(null);
    await expect(createOrder(buildCreateOrderInput([item()], checkout()))).rejects.toMatchObject({ status: 401 });

    setToken(TEST_TOKEN);
    server.use(
      http.post(`${API}/client/orders`, () =>
        HttpResponse.json({ message: 'bad', errors: { 'items.0.size': ['Out of stock'] } }, { status: 422 }),
      ),
    );
    const err = await rejection(createOrder(buildCreateOrderInput([item()], checkout())));
    expect(err.detail).toBe('Out of stock');
  });

  it('listOrders / getOrder', async () => {
    await expect(listOrders()).resolves.toEqual([]);
    await expect(getOrder('KFT-0001')).resolves.toMatchObject({ orderNumber: 'KFT-0001' });
    await expect(getOrder('MISSING')).rejects.toMatchObject({ status: 404 });
  });
});
