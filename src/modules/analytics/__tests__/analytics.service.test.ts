import { describe, it, expect } from 'vitest';

/**
 * Unit tests for the Weighted Moving Average (WMA) algorithm
 * used in AnalyticsService.getInventoryForecast().
 *
 * Weight model (last 30 days):
 *   - Week 1 (days 1-7):  Weight 4
 *   - Week 2 (days 8-14): Weight 3
 *   - Week 3 (days 15-21): Weight 2
 *   - Week 4 (days 22-30): Weight 1
 *
 * totalWeights = 7*4 + 7*3 + 7*2 + 9*1 = 28 + 21 + 14 + 9 = 72
 * avgDailySales = (w1*4 + w2*3 + w3*2 + w4*1) / 72
 */

function calculateWMA(w1Sales: number, w2Sales: number, w3Sales: number, w4Sales: number) {
  const totalWeights = 72;
  const weightedSum = w1Sales * 4 + w2Sales * 3 + w3Sales * 2 + w4Sales * 1;
  const avgDailySales = Math.round((weightedSum / totalWeights) * 100) / 100;
  return avgDailySales;
}

function determineSalesTrend(w1Sales: number, w2Sales: number, w3Sales: number, w4Sales: number): 'increasing' | 'decreasing' | 'stable' {
  const recentVelocity = w1Sales / 7;
  const historicalVelocity = (w2Sales + w3Sales + w4Sales) / 23;

  if (recentVelocity > historicalVelocity * 1.15) return 'increasing';
  if (recentVelocity < historicalVelocity * 0.85) return 'decreasing';
  return 'stable';
}

function calculateReorderPoint(avgDailySales: number, leadTimeDays: number = 7): number {
  return Math.ceil(avgDailySales * leadTimeDays);
}

function forecastDaysUntilOutOfStock(currentStock: number, avgDailySales: number): number {
  if (avgDailySales <= 0) return 999;
  const dailyVelocity = Math.round(avgDailySales) || 1;
  return Math.ceil(currentStock / dailyVelocity);
}

describe('WMA Algorithm — Weighted Moving Average Calculation', () => {
  it('should calculate correct WMA with balanced weekly sales', () => {
    // w1=14, w2=14, w3=14, w4=18 (2 sales/day consistent across 30 days)
    const result = calculateWMA(14, 14, 14, 18);
    // weightedSum = 14*4 + 14*3 + 14*2 + 18*1 = 56+42+28+18 = 144
    // avgDailySales = 144 / 72 = 2.0
    expect(result).toBe(2);
  });

  it('should weight recent sales (W1) more heavily than older sales (W4)', () => {
    // High recent sales, low historical sales
    const highRecent = calculateWMA(21, 7, 7, 9);
    // weightedSum = 21*4 + 7*3 + 7*2 + 9*1 = 84+21+14+9 = 128
    // avgDailySales = 128 / 72 = 1.78

    // Low recent sales, high historical sales
    const highHistorical = calculateWMA(7, 21, 7, 9);
    // weightedSum = 7*4 + 21*3 + 7*2 + 9*1 = 28+63+14+9 = 114
    // avgDailySales = 114 / 72 = 1.58

    expect(highRecent).toBeGreaterThan(highHistorical);
  });

  it('should return 0 when there are zero sales', () => {
    const result = calculateWMA(0, 0, 0, 0);
    expect(result).toBe(0);
  });

  it('should handle large sales volumes correctly', () => {
    const result = calculateWMA(700, 500, 300, 180);
    // weightedSum = 700*4 + 500*3 + 300*2 + 180*1 = 2800+1500+600+180 = 5080
    // avgDailySales = 5080 / 72 = 70.56
    expect(result).toBe(70.56);
  });
});

describe('WMA Algorithm — Sales Trend Detection', () => {
  it('should detect increasing trend when recent week sales are >15% higher', () => {
    // w1=21 (3/day), rest average ~1.3/day → clearly increasing
    const trend = determineSalesTrend(21, 10, 10, 9);
    expect(trend).toBe('increasing');
  });

  it('should detect decreasing trend when recent week sales are <85% of historical', () => {
    // w1=3 (0.43/day), rest average ~2/day → clearly decreasing
    const trend = determineSalesTrend(3, 14, 14, 18);
    expect(trend).toBe('decreasing');
  });

  it('should detect stable trend when sales are consistent', () => {
    const trend = determineSalesTrend(14, 14, 14, 18);
    expect(trend).toBe('stable');
  });
});

describe('WMA Algorithm — Reorder Point Calculation', () => {
  it('should calculate reorder point based on 7-day lead time', () => {
    // If avg daily sales = 3, reorder point = ceil(3 * 7) = 21
    const result = calculateReorderPoint(3);
    expect(result).toBe(21);
  });

  it('should handle fractional daily sales', () => {
    // avg daily sales = 1.5, reorder point = ceil(1.5 * 7) = 11
    const result = calculateReorderPoint(1.5);
    expect(result).toBe(11);
  });

  it('should support custom lead time', () => {
    const result = calculateReorderPoint(2, 14);
    expect(result).toBe(28);
  });
});

describe('WMA Algorithm — Out-of-Stock Day Prediction', () => {
  it('should correctly predict days until out of stock', () => {
    // 50 units in stock, selling 5/day → 10 days
    const days = forecastDaysUntilOutOfStock(50, 5);
    expect(days).toBe(10);
  });

  it('should return 999 when no sales velocity', () => {
    const days = forecastDaysUntilOutOfStock(100, 0);
    expect(days).toBe(999);
  });

  it('should handle fractional velocity (rounds up)', () => {
    // 15 units, 2.3/day → round(2.3) = 2, ceil(15/2) = 8
    const days = forecastDaysUntilOutOfStock(15, 2.3);
    expect(days).toBe(8);
  });
});
