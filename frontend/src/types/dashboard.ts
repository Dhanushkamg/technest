import type { Order } from './order';

export interface TopSellingProduct {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface TopCategory {
  categoryId: number;
  categoryName: string;
  totalRevenue: number;
  totalQuantitySold: number;
}

export interface RevenueTimelinePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export type DashboardDateRange = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_3_MONTHS' | 'LAST_1_YEAR' | 'CUSTOM';

export interface DashboardResponse {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  dateFilter: string;
  recentOrders: Order[];
  topSellingProducts: TopSellingProduct[];
  topCategories: TopCategory[];
  revenueTimeline: RevenueTimelinePoint[];
}
