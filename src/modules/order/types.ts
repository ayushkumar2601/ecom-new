import { OrderStatus } from '@prisma/client';

export interface OrderQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  order?: string;
}
