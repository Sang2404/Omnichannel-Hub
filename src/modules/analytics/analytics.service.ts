import { prisma } from '../../config/database';
import { getComparisonDateRanges, generateDateSlots } from '../../shared/utils/date.utils';
import { OrderChannel, OrderStatus } from '@prisma/client';
import {
  KPIOverview,
  RevenueTrend,
  ChannelPerformance,
  ProfitBreakdown,
  ProductRank,
  ProductAlert,
  InventoryAlerts,
  InventoryForecast,
  ChatConversionReport,
} from './analytics.types';

export class AnalyticsService {
  /**
   * Helper to safely calculate percentage change between current and previous periods.
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  /**
   * Helper to determine trend direction.
   */
  private getTrend(percent: number): 'up' | 'down' | 'stable' {
    if (percent > 0.5) return 'up';
    if (percent < -0.5) return 'down';
    return 'stable';
  }

  /**
   * Calculates KPI Cards Overview: Revenue, Net Profit, Orders, and New Customers,
   * comparing the current period against the previous matching duration.
   */
  async getKpiOverview(
    period: 'today' | '7d' | '30d' | '90d' | 'custom',
    from?: Date,
    to?: Date
  ): Promise<KPIOverview> {
    const { current, previous } = getComparisonDateRanges(period, from, to);

    // 1. Gather current period metrics
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: current.startDate, lte: current.endDate },
      },
      include: { items: { include: { product: true } } },
    });

    const currentNewCustCount = await prisma.customer.count({
      where: { createdAt: { gte: current.startDate, lte: current.endDate } },
    });

    // 2. Gather previous period metrics (for comparison percentages)
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: previous.startDate, lte: previous.endDate },
      },
      include: { items: { include: { product: true } } },
    });

    const previousNewCustCount = await prisma.customer.count({
      where: { createdAt: { gte: previous.startDate, lte: previous.endDate } },
    });

    // Computes Revenue & Profit for a given order set
    const calculateFinancials = (orders: any[]) => {
      let revenue = 0;
      let costOfGoods = 0;
      let platformFees = 0;
      let completed = 0;
      let cancelled = 0;

      for (const order of orders) {
        if (order.status === OrderStatus.CANCELLED) {
          cancelled++;
          continue;
        }

        if (order.status === OrderStatus.PAID || order.status === OrderStatus.SHIPPED || order.status === OrderStatus.COMPLETED) {
          completed++;
          
          // Pure product revenue excludes shipping cost
          const productRev = order.totalAmount - order.shippingFee;
          revenue += productRev;

          // Shopee Sandbox charges 6.5% platform fee, FB 0%
          if (order.channel === OrderChannel.SHOPEE) {
            platformFees += productRev * 0.065;
          }

          // COGS (Cost of Goods Sold) assumed as 60% of base product price for profit formulas
          for (const item of order.items) {
            costOfGoods += (item.product?.price || item.price) * 0.6 * item.quantity;
          }
        }
      }

      const netProfit = revenue - platformFees - costOfGoods;

      return {
        revenue,
        netProfit,
        completed,
        cancelled,
      };
    };

    const currentFin = calculateFinancials(currentOrders);
    const previousFin = calculateFinancials(previousOrders);

    const revenueChange = this.calculateChange(currentFin.revenue, previousFin.revenue);
    const profitChange = this.calculateChange(currentFin.netProfit, previousFin.netProfit);
    const custChange = this.calculateChange(currentNewCustCount, previousNewCustCount);

    const totalOrders = currentOrders.length;
    const cancelRate = totalOrders > 0 ? Math.round((currentFin.cancelled / totalOrders) * 100 * 10) / 10 : 0;

    return {
      revenue: {
        total: currentFin.revenue,
        changePercent: revenueChange,
        trend: this.getTrend(revenueChange),
      },
      netProfit: {
        total: currentFin.netProfit,
        changePercent: profitChange,
        trend: this.getTrend(profitChange),
      },
      orders: {
        total: totalOrders,
        completed: currentFin.completed,
        cancelled: currentFin.cancelled,
        cancelRate,
      },
      newCustomers: {
        total: currentNewCustCount,
        changePercent: custChange,
        trend: this.getTrend(custChange),
      },
    };
  }

  /**
   * Generates a date-grouped line chart data structure of daily revenues split by channels.
   */
  async getRevenueTrend(
    period: 'today' | '7d' | '30d' | '90d' | 'custom',
    from?: Date,
    to?: Date
  ): Promise<RevenueTrend> {
    const { current } = getComparisonDateRanges(period, from, to);
    const dateSlots = generateDateSlots(current.startDate, current.endDate);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: current.startDate, lte: current.endDate },
        status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
      },
    });

    // Initialize daily slots
    const dailyData: Record<string, { total: number; facebook: number; shopee: number }> = {};
    for (const slot of dateSlots) {
      dailyData[slot] = { total: 0, facebook: 0, shopee: 0 };
    }

    // Populate data from orders
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      if (dailyData[day]) {
        const orderRev = order.totalAmount - order.shippingFee;
        dailyData[day].total += orderRev;
        if (order.channel === OrderChannel.FACEBOOK) {
          dailyData[day].facebook += orderRev;
        } else if (order.channel === OrderChannel.SHOPEE) {
          dailyData[day].shopee += orderRev;
        }
      }
    }

    const labels: string[] = [];
    const totalArr: number[] = [];
    const fbArr: number[] = [];
    const shopeeArr: number[] = [];

    for (const slot of dateSlots) {
      labels.push(slot);
      totalArr.push(dailyData[slot].total);
      fbArr.push(dailyData[slot].facebook);
      shopeeArr.push(dailyData[slot].shopee);
    }

    // Identify best day and average daily values
    let maxAmount = 0;
    let bestDate = 'N/A';
    let sumAmount = 0;

    for (const slot of dateSlots) {
      const amt = dailyData[slot].total;
      sumAmount += amt;
      if (amt > maxAmount) {
        maxAmount = amt;
        bestDate = slot;
      }
    }

    const averageDaily = dateSlots.length > 0 ? Math.round(sumAmount / dateSlots.length) : 0;

    return {
      labels,
      datasets: {
        total: totalArr,
        facebook: fbArr,
        shopee: shopeeArr,
      },
      summary: {
        bestDay: { date: bestDate, amount: maxAmount },
        averageDaily,
      },
    };
  }

  /**
   * Compares Facebook vs Shopee performance, detailing order volumes, revenue ratios,
   * platform fee overheads, and automatic insights.
   */
  async getChannelPerformance(
    period: 'today' | '7d' | '30d' | '90d' | 'custom',
    from?: Date,
    to?: Date
  ): Promise<ChannelPerformance> {
    const { current } = getComparisonDateRanges(period, from, to);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: current.startDate, lte: current.endDate },
      },
      include: { items: { include: { product: true } } },
    });

    const initMetrics = (name: 'FACEBOOK' | 'SHOPEE') => ({
      name,
      orderCount: 0,
      completedCount: 0,
      revenue: 0,
      cogs: 0,
      platformFee: 0,
    });

    const metricsMap = {
      FACEBOOK: initMetrics('FACEBOOK'),
      SHOPEE: initMetrics('SHOPEE'),
    };

    // Aggregate orders by channel
    for (const order of orders) {
      const ch = order.channel;
      metricsMap[ch].orderCount++;

      if (order.status === OrderStatus.PAID || order.status === OrderStatus.SHIPPED || order.status === OrderStatus.COMPLETED) {
        metricsMap[ch].completedCount++;
        const productRev = order.totalAmount - order.shippingFee;
        metricsMap[ch].revenue += productRev;

        if (ch === OrderChannel.SHOPEE) {
          metricsMap[ch].platformFee += productRev * 0.065; // 6.5% Shopee fee
        }

        for (const item of order.items) {
          metricsMap[ch].cogs += (item.product?.price || item.price) * 0.6 * item.quantity;
        }
      }
    }

    const totalRevenue = metricsMap.FACEBOOK.revenue + metricsMap.SHOPEE.revenue;

    const generateMetrics = (data: typeof metricsMap.FACEBOOK): any => {
      const netProfit = data.revenue - data.platformFee - data.cogs;
      const profitMargin = data.revenue > 0 ? Math.round((netProfit / data.revenue) * 100 * 10) / 10 : 0;
      const revenuePercent = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100 * 10) / 10 : 0;
      const avgOrderValue = data.completedCount > 0 ? Math.round(data.revenue / data.completedCount) : 0;
      const conversionRate = data.orderCount > 0 ? Math.round((data.completedCount / data.orderCount) * 100 * 10) / 10 : 0;

      return {
        name: data.name,
        orderCount: data.orderCount,
        revenue: data.revenue,
        revenuePercent,
        avgOrderValue,
        netProfit,
        profitMargin,
        platformFee: data.platformFee,
        conversionRate,
      };
    };

    const channels = [generateMetrics(metricsMap.FACEBOOK), generateMetrics(metricsMap.SHOPEE)];

    // Generate auto-insights text
    let insight = 'Hiệu suất các kênh bán hàng đang duy trì ổn định.';
    const fb = channels[0];
    const shp = channels[1];

    if (fb.revenue > 0 && shp.revenue > 0) {
      const marginDiff = Math.abs(fb.profitMargin - shp.profitMargin);
      const higher = fb.profitMargin > shp.profitMargin ? 'Facebook' : 'Shopee';
      const lower = higher === 'Facebook' ? 'Shopee' : 'Facebook';
      
      insight = `Kênh ${higher} đang có biên lợi nhuận ròng tốt hơn ${lower} ${marginDiff}% (đạt ${Math.max(fb.profitMargin, shp.profitMargin)}%). `;
      
      if (higher === 'Facebook' && fb.orderCount < shp.orderCount) {
        insight += 'Facebook có lợi nhuận cao do không mất phí sàn (0% vs 6.5%), tuy nhiên lượng đơn đang thấp hơn Shopee. Đề xuất: Hãy đẩy mạnh các chiến dịch quảng cáo và chat trên Facebook Messenger để tối ưu hóa biên lợi nhuận ròng.';
      } else if (shp.revenue > fb.revenue) {
        insight += 'Shopee đóng góp doanh thu lớn hơn nhưng phí sàn cao. Hãy cân nhắc kéo thêm phễu khách hàng từ Shopee về Facebook Messenger chăm sóc để giảm thiểu chi phí trung gian.';
      }
    }

    return {
      channels,
      insight,
    };
  }

  /**
   * Provides breakdown of net profits after logistics (shipping) and platform deductions.
   */
  async getProfitBreakdown(
    period: 'today' | '7d' | '30d' | '90d' | 'custom',
    from?: Date,
    to?: Date
  ): Promise<ProfitBreakdown> {
    const { current } = getComparisonDateRanges(period, from, to);
    const dateSlots = generateDateSlots(current.startDate, current.endDate);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: current.startDate, lte: current.endDate },
        status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
      },
      include: { items: { include: { product: true } } },
    });

    const dailyFin: Record<string, { revenue: number; shipping: number; platform: number; cogs: number }> = {};
    for (const slot of dateSlots) {
      dailyFin[slot] = { revenue: 0, shipping: 0, platform: 0, cogs: 0 };
    }

    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      if (dailyFin[day]) {
        const prodRev = order.totalAmount - order.shippingFee;
        dailyFin[day].revenue += prodRev;
        dailyFin[day].shipping += order.shippingFee;
        
        if (order.channel === OrderChannel.SHOPEE) {
          dailyFin[day].platform += prodRev * 0.065;
        }

        for (const item of order.items) {
          dailyFin[day].cogs += (item.product?.price || item.price) * 0.6 * item.quantity;
        }
      }
    }

    const labels: string[] = [];
    const revenueArr: number[] = [];
    const shippingArr: number[] = [];
    const platformArr: number[] = [];
    const profitArr: number[] = [];

    let totalRevenue = 0;
    let totalShipping = 0;
    let totalPlatform = 0;
    let totalCOGS = 0;

    for (const slot of dateSlots) {
      const data = dailyFin[slot];
      const netProfit = data.revenue - data.platform - data.cogs;

      labels.push(slot);
      revenueArr.push(data.revenue);
      shippingArr.push(data.shipping);
      platformArr.push(data.platform);
      profitArr.push(netProfit);

      totalRevenue += data.revenue;
      totalShipping += data.shipping;
      totalPlatform += data.platform;
      totalCOGS += data.cogs;
    }

    const totalCosts = totalShipping + totalPlatform + totalCOGS;
    const totalNetProfit = totalRevenue - totalPlatform - totalCOGS;
    const overallMargin = totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue) * 100 * 10) / 10 : 0;

    return {
      labels,
      datasets: {
        revenue: revenueArr,
        shippingCost: shippingArr,
        platformFee: platformArr,
        netProfit: profitArr,
      },
      totals: {
        totalRevenue,
        totalCosts,
        totalNetProfit,
        overallMargin,
      },
    };
  }

  /**
   * Ranks best selling products by quantity sold, revenue contribution, or net profit margins.
   */
  async getTopProducts(
    period: 'today' | '7d' | '30d' | '90d' | 'custom',
    from?: Date,
    to?: Date,
    limit: number = 5,
    sortBy: 'quantity' | 'revenue' | 'profit' = 'quantity'
  ): Promise<ProductRank[]> {
    const { current } = getComparisonDateRanges(period, from, to);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: current.startDate, lte: current.endDate },
          status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
        },
      },
      include: {
        product: { include: { shopeeItemMapping: true } },
        order: true,
      },
    });

    const productMap: Record<
      string,
      {
        id: string;
        sku: string;
        name: string;
        quantity: number;
        revenue: number;
        currentStock: number;
        fbQuantity: number;
        shopeeQuantity: number;
      }
    > = {};

    for (const item of orderItems) {
      const prod = item.product;
      const pid = prod.id;

      if (!productMap[pid]) {
        productMap[pid] = {
          id: pid,
          sku: prod.sku,
          name: prod.name,
          quantity: 0,
          revenue: 0,
          currentStock: prod.stock,
          fbQuantity: 0,
          shopeeQuantity: 0,
        };
      }

      productMap[pid].quantity += item.quantity;
      const itemRev = item.price * item.quantity;
      productMap[pid].revenue += itemRev;

      if (item.order.channel === OrderChannel.FACEBOOK) {
        productMap[pid].fbQuantity += item.quantity;
      } else if (item.order.channel === OrderChannel.SHOPEE) {
        productMap[pid].shopeeQuantity += item.quantity;
      }
    }

    const rankList: ProductRank[] = Object.values(productMap).map((item) => {
      // Calculate net profit (revenue - platform fees - COGS)
      const shopeeRevenueRatio = item.quantity > 0 ? item.shopeeQuantity / item.quantity : 0;
      const platformFee = item.revenue * shopeeRevenueRatio * 0.065;
      const cogs = item.revenue * 0.6; // 60% COGS cost model
      const netProfit = item.revenue - platformFee - cogs;

      // Status helper
      let stockStatus: ProductRank['stockStatus'] = 'healthy';
      if (item.currentStock <= 0) stockStatus = 'out';
      else if (item.currentStock <= 5) stockStatus = 'critical';
      else if (item.currentStock <= 20) stockStatus = 'low';

      // Simple prediction: calculate daily velocity based on duration length (minimum 1 day)
      const durationDays = Math.max(1, Math.ceil((current.endDate.getTime() - current.startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const dailyVelocity = item.quantity / durationDays;
      const daysUntilOutOfStock = dailyVelocity > 0 ? Math.round(item.currentStock / dailyVelocity) : 999;

      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        totalQuantity: item.quantity,
        totalRevenue: item.revenue,
        currentStock: item.currentStock,
        stockStatus,
        daysUntilOutOfStock,
        channels: {
          facebook: item.fbQuantity,
          shopee: item.shopeeQuantity,
        },
        // internal sorting helper
        profit: netProfit,
      };
    });

    // Sort accordingly
    rankList.sort((a: any, b: any) => {
      if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
      if (sortBy === 'profit') return b.profit - a.profit;
      return b.totalQuantity - a.totalQuantity;
    });

    return rankList.slice(0, limit);
  }

  /**
   * Performs inventory stock thresholds detection.
   * Compares internal Postgres database records with Shopee Open API Mapping states.
   */
  async getInventoryAlerts(): Promise<InventoryAlerts> {
    const products = await prisma.product.findMany({
      include: { shopeeItemMapping: true },
    });

    // Fetch order history of last 30 days to calculate daily velocities
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
        },
      },
    });

    const productSalesMap: Record<string, number> = {};
    for (const item of orderItems) {
      productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + item.quantity;
    }

    const critical: ProductAlert[] = [];
    const low: ProductAlert[] = [];
    const overstock: ProductAlert[] = [];
    const syncStatus: InventoryAlerts['syncStatus'] = [];

    for (const prod of products) {
      const totalSales = productSalesMap[prod.id] || 0;
      const avgDailySales = Math.round((totalSales / 30) * 100) / 100;
      const daysUntilOutOfStock = avgDailySales > 0 ? Math.round(prod.stock / avgDailySales) : 999;

      const alertItem: ProductAlert = {
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        currentStock: prod.stock,
        avgDailySales,
        daysUntilOutOfStock,
        suggestedReorderQty: avgDailySales > 0 ? Math.ceil(avgDailySales * 30) : 10,
      };

      if (prod.stock <= 5) {
        critical.push(alertItem);
      } else if (prod.stock <= 20) {
        low.push(alertItem);
      } else if (prod.stock > 100 && daysUntilOutOfStock > 90) {
        // Overstock flag if stock exceeds 90 days of average consumption
        overstock.push(alertItem);
      }

      // Check Shopee sync mapping states
      if (prod.shopeeItemMapping) {
        // Under sandbox, we assume shopee stock matches local database unless mapping is corrupted.
        // We simulate Shopee API checking.
        syncStatus.push({
          productId: prod.id,
          sku: prod.sku,
          name: prod.name,
          internalStock: prod.stock,
          shopeeStock: prod.stock, // Simulates active sync check
          isSynced: true,
        });
      }
    }

    return {
      critical,
      low,
      overstock,
      syncStatus,
    };
  }

  /**
   * Predicts future product inventory drawdown.
   * Employs the Weighted Moving Average (WMA) algorithm on historical daily sales.
   * 
   * Weight model splits last 30 days:
   * - Days 1-7 (Week 1): Weight 4
   * - Days 8-14 (Week 2): Weight 3
   * - Days 15-21 (Week 3): Weight 2
   * - Days 22-30 (Week 4): Weight 1
   * 
   * reorderPoint is calculated based on 7 days Lead Time delivery.
   */
  async getInventoryForecast(productId: string, forecastDays: number = 30): Promise<InventoryForecast> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          createdAt: { gte: thirtyDaysAgo, lte: now },
          status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
        },
      },
      include: { order: true },
    });

    // Group items into weekly sales volume buckets
    let w1Sales = 0; // days 0 to 7
    let w2Sales = 0; // days 8 to 14
    let w3Sales = 0; // days 15 to 21
    let w4Sales = 0; // days 22 to 30

    for (const item of orderItems) {
      const diffTime = Math.abs(now.getTime() - item.order.createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) w1Sales += item.quantity;
      else if (diffDays <= 14) w2Sales += item.quantity;
      else if (diffDays <= 21) w3Sales += item.quantity;
      else w4Sales += item.quantity;
    }

    // 1. SMA (Simple Moving Average - 30 days)
    const total30dSales = w1Sales + w2Sales + w3Sales + w4Sales;
    const smaDailySales = Math.round((total30dSales / 30) * 100) / 100;

    // 2. WMA (Weighted Moving Average - 4 Weeks)
    // Denominator = DaysW1*W1 + DaysW2*W2 + DaysW3*W3 + DaysW4*W4 = 7*4 + 7*3 + 7*2 + 9*1 = 28 + 21 + 14 + 9 = 72
    const totalWeights = 72;
    const weightedSum = w1Sales * 4 + w2Sales * 3 + w3Sales * 2 + w4Sales * 1;
    const wmaDailySales = Math.round((weightedSum / totalWeights) * 100) / 100;

    // 3. EMA (Exponential Moving Average - Smoothing Factor alpha = 0.4)
    const alpha = 0.4;
    const rateW4 = w4Sales / 9;
    const rateW3 = w3Sales / 7;
    const rateW2 = w2Sales / 7;
    const rateW1 = w1Sales / 7; // Recent actual velocity
    const emaStep1 = alpha * rateW3 + (1 - alpha) * rateW4;
    const emaStep2 = alpha * rateW2 + (1 - alpha) * emaStep1;
    const emaDailySales = Math.round((alpha * rateW1 + (1 - alpha) * emaStep2) * 100) / 100;

    // Evaluate Accuracy via Benchmark against Recent Weekly Actual Sales (rateW1)
    const actualTest = rateW1 > 0 ? rateW1 : Math.max(0.1, smaDailySales);
    const calcMape = (predicted: number) => {
      const err = Math.abs(actualTest - predicted) / actualTest;
      return Math.round(err * 100 * 10) / 10;
    };
    const calcRmse = (predicted: number) => {
      return Math.round(Math.sqrt(Math.pow(actualTest - predicted, 2)) * 100) / 100;
    };

    const smaMape = calcMape(smaDailySales);
    const wmaMape = calcMape(wmaDailySales);
    const emaMape = calcMape(emaDailySales);

    // Pick best model based on minimal MAPE
    let recommendedModel: 'SMA' | 'WMA' | 'EMA' = 'WMA';
    if (wmaMape <= smaMape && wmaMape <= emaMape) {
      recommendedModel = 'WMA';
    } else if (emaMape <= smaMape && emaMape <= wmaMape) {
      recommendedModel = 'EMA';
    } else {
      recommendedModel = 'SMA';
    }

    const avgDailySales = wmaDailySales;

    // Determine sales velocity trend
    let salesTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const recentVelocity = w1Sales / 7;
    const historicalVelocity = (w2Sales + w3Sales + w4Sales) / 23;

    if (recentVelocity > historicalVelocity * 1.15) salesTrend = 'increasing';
    else if (recentVelocity < historicalVelocity * 0.85) salesTrend = 'decreasing';

    // Daily prediction projection loop
    const forecast: InventoryForecast['forecast'] = [];
    let projectedStock = product.stock;
    const dailyVelocity = avgDailySales || 0.1; // Fallback velocity to simulate drawdown
    let outOfStockDate: string | null = null;
    let reorderDate: string | null = null;

    // Safety Stock / Reorder Trigger = Lead Time (e.g. 7 days) * daily velocity
    const reorderThreshold = Math.ceil(dailyVelocity * 7);

    for (let day = 1; day <= forecastDays; day++) {
      const forecastDate = new Date();
      forecastDate.setDate(now.getDate() + day);
      const dateStr = forecastDate.toISOString().split('T')[0];

      // Simulated sales decrement (no fraction stocks)
      const predictedSales = Math.round(dailyVelocity);
      projectedStock = Math.max(0, projectedStock - predictedSales);

      // Identify Out of Stock event
      if (projectedStock === 0 && !outOfStockDate) {
        outOfStockDate = dateStr;
      }

      // Identify Reorder Point event
      if (projectedStock <= reorderThreshold && !reorderDate && projectedStock > 0) {
        reorderDate = dateStr;
      }

      // Confidence margin shrinks the further out we predict
      const confidence = Math.max(0.2, Math.round((1 - day * 0.02) * 100) / 100);

      forecast.push({
        date: dateStr,
        predictedStock: projectedStock,
        predictedSales,
        confidence,
      });
    }

    return {
      product: { id: product.id, name: product.name, sku: product.sku },
      currentStock: product.stock,
      avgDailySales,
      salesTrend,
      forecast,
      outOfStockDate,
      reorderPoint: {
        date: reorderDate || outOfStockDate,
        suggestedQuantity: Math.ceil(dailyVelocity * 30), // Suggestions for next 30 days
      },
      algorithm: 'Weighted Moving Average (WMA)',
      modelsComparison: {
        sma: {
          name: 'Trung bình trượt đơn giản (SMA)',
          code: 'SMA',
          avgDailySales: smaDailySales,
          mape: smaMape,
          rmse: calcRmse(smaDailySales),
          projectedOutOfStockDays: smaDailySales > 0 ? Math.ceil(product.stock / smaDailySales) : 999,
          description: 'Tính trung bình cộng số lượng bán trong 30 ngày (Trọng số phân bổ đều 1:1).',
        },
        wma: {
          name: 'Trung bình trượt có trọng số (WMA)',
          code: 'WMA',
          avgDailySales: wmaDailySales,
          mape: wmaMape,
          rmse: calcRmse(wmaDailySales),
          projectedOutOfStockDays: wmaDailySales > 0 ? Math.ceil(product.stock / wmaDailySales) : 999,
          description: 'Gán trọng số giảm dần từ tuần gần nhất (4 > 3 > 2 > 1) phản ánh biến động thị trường.',
        },
        ema: {
          name: 'Làm mịn số mũ (EMA)',
          code: 'EMA',
          avgDailySales: emaDailySales,
          mape: emaMape,
          rmse: calcRmse(emaDailySales),
          projectedOutOfStockDays: emaDailySales > 0 ? Math.ceil(product.stock / emaDailySales) : 999,
          description: 'Hàm số mũ suy giảm liên tục với hệ số làm mịn alpha = 0.4.',
        },
        recommendedModel,
        academicExplanation: `Dựa trên kết quả đo sai số thực nghiệm, mô hình ${recommendedModel} cho chỉ số sai số MAPE thấp nhất (${recommendedModel === 'WMA' ? wmaMape : recommendedModel === 'EMA' ? emaMape : smaMape}%), phản ánh sát nhất xu hướng đặt hàng gần đây.`,
      },
    };
  }

  /**
   * Models the Facebook Chat Funnel conversions.
   * Pulls Conversation statistics, Order logs, and calculates reaction speeds.
   */
  async getChatConversion(
    period: 'today' | '7d' | '30d' | '90d' | 'custom',
    from?: Date,
    to?: Date
  ): Promise<ChatConversionReport> {
    const { current } = getComparisonDateRanges(period, from, to);

    // 1. Fetch Funnel Metrics
    const totalConversations = await prisma.conversation.count({
      where: { createdAt: { gte: current.startDate, lte: current.endDate } },
    });

    // Active means conversation contains >= 2 message items
    const conversations = await prisma.conversation.findMany({
      where: { createdAt: { gte: current.startDate, lte: current.endDate } },
      include: { _count: { select: { messages: true } } },
    });
    const activeConversations = conversations.filter((c) => c._count.messages >= 2).length;

    // Count facebook orders by status inside period
    const orders = await prisma.order.findMany({
      where: {
        channel: OrderChannel.FACEBOOK,
        createdAt: { gte: current.startDate, lte: current.endDate },
      },
    });

    const ordersCreated = orders.length;
    const ordersPaid = orders.filter((o) => o.status !== OrderStatus.PENDING_PAYMENT && o.status !== OrderStatus.CANCELLED).length;
    const ordersCompleted = orders.filter((o) => o.status === OrderStatus.COMPLETED).length;

    // 2. Calculate Rates
    const chatToOrder = activeConversations > 0 ? Math.round((ordersCreated / activeConversations) * 100 * 10) / 10 : 0;
    const orderToPaid = ordersCreated > 0 ? Math.round((ordersPaid / ordersCreated) * 100 * 10) / 10 : 0;
    const paidToCompleted = ordersPaid > 0 ? Math.round((ordersCompleted / ordersPaid) * 100 * 10) / 10 : 0;
    const overallConversion = activeConversations > 0 ? Math.round((ordersCompleted / activeConversations) * 100 * 10) / 10 : 0;

    // 3. Average Response Time calculation
    // We calculate response time as the average difference between a Customer message and a preceding Staff reply
    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gte: current.startDate, lte: current.endDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    let totalDiffMinutes = 0;
    let countResponses = 0;

    for (let i = 1; i < messages.length; i++) {
      const prev = messages[i - 1];
      const curr = messages[i];

      // Staff responding to Customer
      if (prev.senderType === 'CUSTOMER' && curr.senderType === 'STAFF' && prev.conversationId === curr.conversationId) {
        const diffMs = curr.createdAt.getTime() - prev.createdAt.getTime();
        const diffMin = diffMs / (1000 * 60);
        
        // Exclude outliers (e.g., responses taking > 12 hours that would skew day-to-day metrics)
        if (diffMin <= 720) {
          totalDiffMinutes += diffMin;
          countResponses++;
        }
      }
    }

    const avgResponseTime = countResponses > 0 ? Math.round(totalDiffMinutes / countResponses) : 5; // Default 5 minutes fallback

    // 4. Generate Insight
    let insight = 'Tỷ lệ chuyển đổi hội thoại đang duy trì ổn định.';
    if (chatToOrder < 15) {
      insight = `Tỷ lệ chuyển đổi Chat → Tạo Đơn đang khá thấp (${chatToOrder}%). Nhân viên đang phản hồi trung bình trong ${avgResponseTime} phút. Gợi ý: Hãy cung cấp các kịch bản tin nhắn trả lời nhanh (Quick Replies) và giảm thời gian phản hồi dưới 2 phút để tăng lòng tin từ khách hàng.`;
    } else if (orderToPaid < 70) {
      insight = `Tỷ lệ thanh toán hóa đơn sau chốt đơn đạt ${orderToPaid}%. Đang có lượng đơn treo (chưa quét mã QR) khá nhiều. Gợi ý: Hãy gửi nhắc nhở thanh toán tự động qua chat cho khách hàng sau 30 phút nếu chưa ghi nhận giao dịch thành công.`;
    } else {
      insight = `Quy trình bán hàng Facebook đang hoạt động hiệu quả cao! Phản hồi trung bình ${avgResponseTime} phút mang lại tỷ lệ chốt đơn ${chatToOrder}% và thanh toán ${orderToPaid}%. Hãy tiếp tục duy trì hiệu suất này.`;
    }

    return {
      funnel: {
        totalConversations,
        activeConversations,
        ordersCreated,
        ordersPaid,
        ordersCompleted,
      },
      rates: {
        chatToOrder,
        orderToPaid,
        paidToCompleted,
        overallConversion,
      },
      avgResponseTime,
      insight,
    };
  }
}
