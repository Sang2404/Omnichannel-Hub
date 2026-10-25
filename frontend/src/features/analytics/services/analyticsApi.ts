import { axiosClient } from '../../../core/api/axiosClient';

// ─── TypeScript Interfaces (mirrored from backend analytics.types.ts) ───

export interface KPIValue {
  total: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface KPIOverview {
  revenue: KPIValue;
  netProfit: KPIValue;
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    cancelRate: number;
  };
  newCustomers: KPIValue;
}

export interface RevenueTrend {
  labels: string[];
  datasets: {
    total: number[];
    facebook: number[];
    shopee: number[];
  };
  summary: {
    bestDay: { date: string; amount: number };
    averageDaily: number;
  };
}

export interface ChannelMetrics {
  name: 'FACEBOOK' | 'SHOPEE';
  orderCount: number;
  revenue: number;
  revenuePercent: number;
  avgOrderValue: number;
  netProfit: number;
  profitMargin: number;
  platformFee: number;
  conversionRate: number;
}

export interface ChannelPerformance {
  channels: ChannelMetrics[];
  insight: string;
}

export interface ProfitBreakdown {
  labels: string[];
  datasets: {
    revenue: number[];
    shippingCost: number[];
    platformFee: number[];
    netProfit: number[];
  };
  totals: {
    totalRevenue: number;
    totalCosts: number;
    totalNetProfit: number;
    overallMargin: number;
  };
}

export interface ProductRank {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  currentStock: number;
  stockStatus: 'healthy' | 'low' | 'critical' | 'out';
  daysUntilOutOfStock: number;
  channels: {
    facebook: number;
    shopee: number;
  };
}

export interface ProductAlert {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilOutOfStock: number;
  suggestedReorderQty: number;
}

export interface InventoryAlerts {
  critical: ProductAlert[];
  low: ProductAlert[];
  overstock: ProductAlert[];
  syncStatus: Array<{
    productId: string;
    sku: string;
    name: string;
    internalStock: number;
    shopeeStock: number | null;
    isSynced: boolean;
  }>;
}

export interface ForecastSlot {
  date: string;
  predictedStock: number;
  predictedSales: number;
  confidence: number;
}

export interface ModelMetric {
  name: string;
  code: 'SMA' | 'WMA' | 'EMA';
  avgDailySales: number;
  mape: number;
  rmse: number;
  projectedOutOfStockDays: number;
  description: string;
}

export interface InventoryForecast {
  product: { id: string; name: string; sku: string };
  currentStock: number;
  avgDailySales: number;
  salesTrend: 'increasing' | 'decreasing' | 'stable';
  forecast: ForecastSlot[];
  outOfStockDate: string | null;
  reorderPoint: {
    date: string | null;
    suggestedQuantity: number;
  };
  algorithm: string;
  modelsComparison?: {
    sma: ModelMetric;
    wma: ModelMetric;
    ema: ModelMetric;
    recommendedModel: 'SMA' | 'WMA' | 'EMA';
    academicExplanation: string;
  };
}

export interface ChatFunnel {
  totalConversations: number;
  activeConversations: number;
  ordersCreated: number;
  ordersPaid: number;
  ordersCompleted: number;
}

export interface ChatConversionReport {
  funnel: ChatFunnel;
  rates: {
    chatToOrder: number;
    orderToPaid: number;
    paidToCompleted: number;
    overallConversion: number;
  };
  avgResponseTime: number;
  insight: string;
}

// ─── API Response Wrapper ───

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Analytics API Client ───

export const analyticsApi = {
  getKpiOverview: async (period: string = '30d'): Promise<ApiResponse<KPIOverview>> => {
    return axiosClient.get('/analytics/kpi-overview', { params: { period } });
  },

  getRevenueTrend: async (period: string = '30d'): Promise<ApiResponse<RevenueTrend>> => {
    return axiosClient.get('/analytics/revenue-trend', { params: { period } });
  },

  getChannelPerformance: async (period: string = '30d'): Promise<ApiResponse<ChannelPerformance>> => {
    return axiosClient.get('/analytics/channel-performance', { params: { period } });
  },

  getProfitBreakdown: async (period: string = '30d'): Promise<ApiResponse<ProfitBreakdown>> => {
    return axiosClient.get('/analytics/profit-breakdown', { params: { period } });
  },

  getTopProducts: async (period: string = '30d', limit: number = 5, sortBy: string = 'quantity'): Promise<ApiResponse<ProductRank[]>> => {
    return axiosClient.get('/analytics/top-products', { params: { period, limit, sortBy } });
  },

  getInventoryAlerts: async (): Promise<ApiResponse<InventoryAlerts>> => {
    return axiosClient.get('/analytics/inventory-alerts');
  },

  getInventoryForecast: async (productId: string, forecastDays: number = 30): Promise<ApiResponse<InventoryForecast>> => {
    return axiosClient.get('/analytics/inventory-forecast', { params: { productId, forecastDays } });
  },

  getChatConversion: async (period: string = '30d'): Promise<ApiResponse<ChatConversionReport>> => {
    return axiosClient.get('/analytics/chat-conversion', { params: { period } });
  },
};
