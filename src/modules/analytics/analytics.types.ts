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
  mape: number; // Mean Absolute Percentage Error (%)
  rmse: number; // Root Mean Squared Error
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

export interface ChatConversionRates {
  chatToOrder: number;
  orderToPaid: number;
  paidToCompleted: number;
  overallConversion: number;
}

export interface ChatConversionReport {
  funnel: ChatFunnel;
  rates: ChatConversionRates;
  avgResponseTime: number; // in minutes
  insight: string;
}
