import { apiRequest } from '../lib/api';
import type { FlashSaleFilters, FlashSaleListResponse, FlashSaleReservation } from '../types';

export interface FlashSaleQuery extends Partial<FlashSaleFilters> {
  page?: number;
  perPage?: number;
}

export const getFlashSales = (q: FlashSaleQuery = {}): Promise<FlashSaleListResponse> =>
  apiRequest<FlashSaleListResponse>('/catalog/flash-sales', {
    auth: false,
    query: {
      tier: q.tier,
      category: q.category,
      size: q.size,
      sort: q.sort,
      page: q.page,
      per_page: q.perPage,
    },
  });

export const reserveFlashSale = (id: string): Promise<FlashSaleReservation> =>
  apiRequest<FlashSaleReservation>(`/client/flash-sales/${encodeURIComponent(id)}/reserve`, {
    method: 'POST',
  });

export const subscribeFlashDrops = (email: string): Promise<{ message: string; subscribed: boolean }> =>
  apiRequest('/newsletter/flash-drops', { method: 'POST', body: { email }, auth: false });
