import { apiRequest } from '../lib/api';
import type { CartItem, CheckoutData } from '../types';
import {
  COMPLEMENT_ID_PREFIX,
  DEFAULT_PAYMENT_METHOD,
  DISPATCH_TO_DELIVERY_METHOD,
  type DeliveryMethod,
} from '../config';

export interface OrderItemInput {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

// Money (delivery cost, discount, totals) is computed by the backend.
export interface CreateOrderInput {
  items: OrderItemInput[];
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  postalCode: string;
  city: string;
  phone?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: string;
  promoCode?: string;
}

export interface Order {
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryCost: number;
  discount: number;
  total: number;
  items: unknown[];
  createdAt: string;
}

export const toDeliveryMethod = (speed: CheckoutData['dispatchSpeed']): DeliveryMethod =>
  DISPATCH_TO_DELIVERY_METHOD[speed ?? 'standard'];

// Complement upsells are mock-only items without a catalog product.
export const filterOrderableItems = (cart: CartItem[]): CartItem[] =>
  cart.filter((item) => !item.productId.startsWith(COMPLEMENT_ID_PREFIX));

export function buildCreateOrderInput(cart: CartItem[], data: CheckoutData): CreateOrderInput {
  return {
    items: filterOrderableItems(cart).map((i) => ({
      productId: i.productId,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    })),
    email: data.email,
    country: data.country,
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address || data.address1 || '',
    apartment: data.apartment || undefined,
    postalCode: data.postalCode,
    city: data.city,
    phone: data.phone || undefined,
    deliveryMethod: toDeliveryMethod(data.dispatchSpeed),
    paymentMethod: data.paymentMethod || DEFAULT_PAYMENT_METHOD,
    promoCode: data.promoCode || undefined,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const res = await apiRequest<{ data: Order }>('/client/orders', { method: 'POST', body: input });
  return res.data;
}

export async function listOrders(): Promise<Order[]> {
  const res = await apiRequest<{ data: Order[] }>('/client/orders');
  return res.data;
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const res = await apiRequest<{ data: Order }>(`/client/orders/${encodeURIComponent(orderNumber)}`);
  return res.data;
}
