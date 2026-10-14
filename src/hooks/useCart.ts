import { useEffect, useState } from 'react';
import type { CartItem, Product } from '../types';
import {
  COMPLEMENT_COLOR,
  COMPLEMENT_DEFAULT_SIZE,
  COMPLEMENT_ID_PREFIX,
  COMPLEMENT_IMAGE,
  STORAGE_KEYS,
} from '../config';

const loadCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.cart);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }, [cart]);

  const addItem = (product: Product, size: string, color: string, quantity: number) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        return prevCart.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        product,
        title: product.title,
        image: product.image,
        priceEUR: product.priceEUR || product.price || 0,
        sku: product.sku || product.code,
        size,
        color,
        quantity,
      };
      return [...prevCart, newItem];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

  const clear = () => setCart([]);

  const addComplement = (title: string, priceEUR: number, sku: string, size: string = COMPLEMENT_DEFAULT_SIZE) => {
    const complementItem: CartItem = {
      id: `cart-comp-${Date.now()}`,
      productId: `${COMPLEMENT_ID_PREFIX}${sku}`,
      title,
      image: COMPLEMENT_IMAGE,
      priceEUR,
      sku,
      size,
      color: COMPLEMENT_COLOR,
      quantity: 1,
    };
    setCart((prev) => [...prev, complementItem]);
  };

  return { cart, addItem, updateQuantity, removeItem, clear, addComplement };
}
