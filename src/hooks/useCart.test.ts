import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { makeProduct } from '../test/handlers';
import { STORAGE_KEYS } from '../config';
import { useCart } from './useCart';

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) ?? 'null');

describe('useCart', () => {
  it('starts empty and persists to localStorage', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.cart).toEqual([]);
    expect(stored()).toEqual([]);
  });

  it('hydrates from localStorage', () => {
    const { result: first } = renderHook(() => useCart());
    act(() => first.current.addItem(makeProduct(), 'M', 'BLACK', 1));
    const { result } = renderHook(() => useCart());
    expect(result.current.cart).toHaveLength(1);
  });

  it('ignores corrupt stored data', () => {
    localStorage.setItem(STORAGE_KEYS.cart, '{not json');
    const { result } = renderHook(() => useCart());
    expect(result.current.cart).toEqual([]);
  });

  it('addItem creates a line with product data and sku fallback to code', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(makeProduct({ sku: '' }), 'M', 'BLACK', 2));
    expect(result.current.cart[0]).toMatchObject({
      productId: '1', title: 'RAW DENIM JACKET', priceEUR: 250, sku: 'KFT-001', size: 'M', color: 'BLACK', quantity: 2,
    });
    expect(stored()[0].quantity).toBe(2);
  });

  it('merges identical product/size/color and keeps different variants separate', () => {
    const { result } = renderHook(() => useCart());
    const p = makeProduct();
    act(() => {
      result.current.addItem(p, 'M', 'BLACK', 1);
      result.current.addItem(p, 'M', 'BLACK', 2);
      result.current.addItem(p, 'L', 'BLACK', 1);
      result.current.addItem(p, 'M', 'WHITE', 1);
    });
    expect(result.current.cart.map((i) => i.quantity)).toEqual([3, 1, 1]);
    expect(result.current.cart).toHaveLength(3);
  });

  it('does not double-count merges under StrictMode (reducers must be pure)', () => {
    const { result } = renderHook(() => useCart(), { wrapper: StrictMode });
    const p = makeProduct();
    act(() => result.current.addItem(p, 'M', 'BLACK', 1));
    act(() => result.current.addItem(p, 'M', 'BLACK', 1));
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it('updateQuantity adjusts and removes the line at zero', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(makeProduct(), 'M', 'BLACK', 2));
    const id = result.current.cart[0].id;
    act(() => result.current.updateQuantity(id, 1));
    expect(result.current.cart[0].quantity).toBe(3);
    act(() => result.current.updateQuantity(id, -3));
    expect(result.current.cart).toEqual([]);
  });

  it('updateQuantity on an unknown id is a no-op', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(makeProduct(), 'M', 'BLACK', 1));
    act(() => result.current.updateQuantity('nope', -5));
    expect(result.current.cart).toHaveLength(1);
  });

  it('removeItem and clear', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem(makeProduct(), 'M', 'BLACK', 1);
      result.current.addItem(makeProduct({ id: '2' }), 'M', 'BLACK', 1);
    });
    act(() => result.current.removeItem(result.current.cart[0].id));
    expect(result.current.cart.map((i) => i.productId)).toEqual(['2']);
    act(() => result.current.clear());
    expect(result.current.cart).toEqual([]);
    expect(stored()).toEqual([]);
  });

  it('addComplement adds a comp- prefixed mock item with default size', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addComplement('TEE', 95, 'SKU-T'));
    expect(result.current.cart[0]).toMatchObject({ productId: 'comp-SKU-T', size: 'M', priceEUR: 95, quantity: 1 });
    act(() => result.current.addComplement('RING', 140, 'SKU-R', '62'));
    expect(result.current.cart[1].size).toBe('62');
  });
});
