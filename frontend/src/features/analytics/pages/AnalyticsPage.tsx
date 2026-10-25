import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, AlertTriangle, RefreshCw,
  ShoppingCart, Percent, Layers, ArrowUpRight, ArrowDownRight,
  Minus, Package, Users, MessageSquare, Zap, Activity,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart,
} from 'recharts';
import {
  analyticsApi,
  type KPIOverview,
  type RevenueTrend,
  type ChannelPerformance,
  type ProfitBreakdown,
  type ProductRank,
  type InventoryAlerts,
  type ChatConversionReport,
} from '../services/analyticsApi';
import { ForecastComparisonWidget } from '../components/ForecastComparisonWidget';

// ─── Helpers ───

const formatVND = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}tr đ`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k đ`;
  return `${Math.round(n).toLocaleString('vi-VN')}đ`;
};

const formatFullVND = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable'; size?: number }> = ({ trend, size = 14 }) => {
  if (trend === 'up') return <ArrowUpRight className="text-emerald-600" style={{ width: size, height: size }} />;
  if (trend === 'down') return <ArrowDownRight className="text-red-500" style={{ width: size, height: size }} />;
  return <Minus className="text-slate-400" style={{ width: size, height: size }} />;
};

const trendColor = (trend: 'up' | 'down' | 'stable') => {
  if (trend === 'up') return 'text-emerald-600';
  if (trend === 'down') return 'text-red-500';
  return 'text-slate-500';
};

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// ─── Skeleton Pulse Component ───

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// ─── Main Component ───

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('30d');

  // Data states
  const [kpi, setKpi] = useState<KPIOverview | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend | null>(null);
  const [channelPerf, setChannelPerf] = useState<ChannelPerformance | null>(null);
  const [profitBreakdown, setProfitBreakdown] = useState<ProfitBreakdown | null>(null);
  const [topProducts, setTopProducts] = useState<ProductRank[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlerts | null>(null);
  const [chatConversion, setChatConversion] = useState<ChatConversionReport | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, trendRes, channelRes, profitRes, topRes, alertRes, chatRes] = await Promise.allSettled([
        analyticsApi.getKpiOverview(timeframe),
        analyticsApi.getRevenueTrend(timeframe),
        analyticsApi.getChannelPerformance(timeframe),
        analyticsApi.getProfitBreakdown(timeframe),
        analyticsApi.getTopProducts(timeframe, 5, 'revenue'),
        analyticsApi.getInventoryAlerts(),
        analyticsApi.getChatConversion(timeframe),
      ]);

      if (kpiRes.status === 'fulfilled' && kpiRes.value.data) setKpi(kpiRes.value.data);
      if (trendRes.status === 'fulfilled' && trendRes.value.data) setRevenueTrend(trendRes.value.data);
      if (channelRes.status === 'fulfilled' && channelRes.value.data) setChannelPerf(channelRes.value.data);
      if (profitRes.status === 'fulfilled' && profitRes.value.data) setProfitBreakdown(profitRes.value.data);
      if (topRes.status === 'fulfilled' && topRes.value.data) setTopProducts(Array.isArray(topRes.value.data) ? topRes.value.data : []);
      if (alertRes.status === 'fulfilled' && alertRes.value.data) setInventoryAlerts(alertRes.value.data);
      if (chatRes.status === 'fulfilled' && chatRes.value.data) setChatConversion(chatRes.value.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Prepare chart data
  const revenueChartData = revenueTrend
    ? revenueTrend.labels.map((label, i) => ({
        date: formatShortDate(label),
        facebook: revenueTrend.datasets.facebook[i],
        shopee: revenueTrend.datasets.shopee[i],
        total: revenueTrend.datasets.total[i],
      }))
    : [];

  const profitChartData = profitBreakdown
    ? profitBreakdown.labels.map((label, i) => ({
        date: formatShortDate(label),
        revenue: profitBreakdown.datasets.revenue[i],
        shipping: profitBreakdown.datasets.shippingCost[i],
        platformFee: profitBreakdown.datasets.platformFee[i],
        netProfit: profitBreakdown.datasets.netProfit[i],
      }))
    : [];

  const totalAlerts = inventoryAlerts
    ? inventoryAlerts.critical.length + inventoryAlerts.low.length
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ────────────────── WORKSPACE HEADER (OPERATE MODE) ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
            <span>Bình Dương Store</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Báo cáo & Phân tích</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Báo Cáo Phân Tích & Dự Báo Kho Đa Kênh
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${
                timeframe === '7d'
                  ? 'bg-white font-bold text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${
                timeframe === '30d'
                  ? 'bg-white font-bold text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 ngày
            </button>
          </div>

          <button
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Làm mới báo cáo"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ────────────────── UNIFIED METRICS STRIP (OPERATE MODE) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Metric 1: Revenue */}
        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Tổng doanh thu thuần</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading || !kpi ? (
              <span className="inline-block h-8 w-32 bg-slate-100 rounded animate-pulse" />
            ) : (
              formatFullVND(kpi.revenue.total)
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <span className={`inline-flex items-center font-bold ${trendColor(kpi?.revenue.trend || 'stable')}`}>
              <TrendIcon trend={kpi?.revenue.trend || 'stable'} size={14} />
              {kpi && kpi.revenue.changePercent > 0 ? '+' : ''}{kpi?.revenue.changePercent || 0}%
            </span>
            <span>so với kỳ trước</span>
          </div>
        </div>

        {/* Metric 2: Net Profit */}
        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Lợi nhuận ròng (Net Profit)</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading || !kpi ? (
              <span className="inline-block h-8 w-32 bg-slate-100 rounded animate-pulse" />
            ) : (
              formatFullVND(kpi.netProfit.total)
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <span className="font-bold text-slate-700">
              Biên LN: {kpi && kpi.revenue.total > 0 ? ((kpi.netProfit.total / kpi.revenue.total) * 100).toFixed(1) : '0'}%
            </span>
            <span>·</span>
            <span>Trừ COGS & Phí sàn</span>
          </div>
        </div>

        {/* Metric 3: Orders */}
        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Tổng đơn hàng xử lý</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading || !kpi ? (
              <span className="inline-block h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              `${kpi.orders.total} đơn`
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span className="font-bold text-emerald-700">{kpi?.orders.completed || 0} hoàn tất</span>
            <span>·</span>
            <span>Hủy: {kpi?.orders.cancelRate || 0}%</span>
          </div>
        </div>

        {/* Metric 4: Customers */}
        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Khách hàng mới</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading || !kpi ? (
              <span className="inline-block h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              `+${kpi.newCustomers.total}`
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <span className={`inline-flex items-center font-bold ${trendColor(kpi?.newCustomers.trend || 'stable')}`}>
              <TrendIcon trend={kpi?.newCustomers.trend || 'stable'} size={14} />
              {kpi && kpi.newCustomers.changePercent > 0 ? '+' : ''}{kpi?.newCustomers.changePercent || 0}%
            </span>
            <span>so với kỳ trước</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ REVENUE TREND CHART ═══════════════════════ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5 mb-4 gap-2">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-blue-600" />
            <span>Xu Hướng Doanh Thu Theo Ngày (Tách Nguồn Facebook vs Shopee)</span>
          </h3>
          {revenueTrend && (
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-slate-500">
                📅 Ngày cao nhất: <strong className="text-slate-900 font-bold">{formatShortDate(revenueTrend.summary.bestDay.date)}</strong> — {formatVND(revenueTrend.summary.bestDay.amount)}
              </span>
              <span className="text-slate-500">
                📊 TB/ngày: <strong className="text-slate-900 font-bold">{formatVND(revenueTrend.summary.averageDaily)}</strong>
              </span>
            </div>
          )}
        </div>
        {loading || revenueChartData.length === 0 ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={revenueChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradFB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradShopee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatVND(v)} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #cbd5e1' }}
                formatter={(value: any) => formatFullVND(Number(value) || 0)}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Area type="monotone" dataKey="facebook" name="Facebook" stroke="#2563eb" strokeWidth={2} fill="url(#gradFB)" />
              <Area type="monotone" dataKey="shopee" name="Shopee" stroke="#f59e0b" strokeWidth={2} fill="url(#gradShopee)" />
              <Line type="monotone" dataKey="total" name="Tổng cộng" stroke="#0f172a" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ═══════════════════════ CHANNEL PERFORMANCE + PROFIT BREAKDOWN ═══════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-blue-600" />
              <span>Phân Tích Doanh Thu Theo Kênh Bán</span>
            </h3>
          </div>

          {loading || !channelPerf ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {channelPerf.channels.map((ch) => {
                  const isFB = ch.name === 'FACEBOOK';
                  return (
                    <div key={ch.name}>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span className={`${isFB ? 'text-blue-700' : 'text-amber-700'} flex items-center gap-1.5`}>
                          <span className={`h-3 w-3 rounded-full ${isFB ? 'bg-blue-600' : 'bg-amber-500'}`} />
                          {isFB ? 'Facebook Messenger' : 'Shopee'}
                        </span>
                        <span className="text-slate-900">{formatFullVND(ch.revenue)} ({ch.revenuePercent}%)</span>
                      </div>
                      <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isFB ? 'bg-blue-600' : 'bg-amber-500'} rounded-full transition-all duration-1000`}
                          style={{ width: `${Math.min(ch.revenuePercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex gap-4 mt-1.5 text-xs text-slate-500 font-medium">
                        <span>📦 {ch.orderCount} đơn</span>
                        <span>💰 TB: {formatVND(ch.avgOrderValue)}</span>
                        <span>📈 Margin: {ch.profitMargin}%</span>
                        {ch.platformFee > 0 && <span className="text-red-500">🏷️ Phí sàn: {formatVND(ch.platformFee)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-sm text-slate-700 mt-2">
                <p className="font-bold text-blue-900 mb-1 flex items-center gap-1.5 text-sm">
                  <Zap className="h-4 w-4 text-blue-600" /> Nhận xét & Đánh giá
                </p>
                <p className="leading-relaxed">{channelPerf.insight}</p>
              </div>
            </>
          )}
        </div>

        {/* Profit Breakdown Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              <span>Phân Tích Dòng Tiền & Lợi Nhuận Ròng</span>
            </h3>
            {profitBreakdown && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold">
                Margin: {profitBreakdown.totals.overallMargin}%
              </span>
            )}
          </div>

          {loading || profitChartData.length === 0 ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={profitChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatVND(v)} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(value: any) => formatFullVND(Number(value) || 0)} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="revenue" name="Doanh Thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shipping" name="Phí Ship GHN" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="platformFee" name="Phí Sàn Shopee" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" name="Lợi Nhuận Ròng" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {profitBreakdown && (
                <div className="grid grid-cols-4 gap-2.5 text-center pt-2">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-700 font-semibold">Doanh Thu</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{formatVND(profitBreakdown.totals.totalRevenue)}</p>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-xl">
                    <p className="text-xs text-red-600 font-semibold">Chi Phí</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{formatVND(profitBreakdown.totals.totalCosts)}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-emerald-700 font-semibold">Lợi Nhuận</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{formatVND(profitBreakdown.totals.totalNetProfit)}</p>
                  </div>
                  <div className="p-2.5 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-700 font-semibold">Margin</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{profitBreakdown.totals.overallMargin}%</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════ TOP PRODUCTS + INVENTORY ALERTS ═══════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Package className="h-4.5 w-4.5 text-indigo-600" />
              <span>Top 5 Sản Phẩm Bán Chạy</span>
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-bold">
              Xếp hạng theo Doanh thu
            </span>
          </div>

          {loading || topProducts.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => {
                const stockColors: Record<string, string> = {
                  healthy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  low: 'text-amber-700 bg-amber-50 border-amber-200',
                  critical: 'text-red-700 bg-red-50 border-red-200',
                  out: 'text-slate-700 bg-slate-100 border-slate-300',
                };
                const stockLabels: Record<string, string> = {
                  healthy: 'Đủ hàng',
                  low: 'Sắp hết',
                  critical: 'Nguy hiểm',
                  out: 'Hết hàng',
                };
                return (
                  <div key={p.id} className="flex items-center gap-3.5 p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-800 font-bold text-sm shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span>SKU: {p.sku}</span>
                        <span>📦 {p.totalQuantity} sp bán</span>
                        <span>💰 {formatVND(p.totalRevenue)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${stockColors[p.stockStatus]}`}>
                        {stockLabels[p.stockStatus]} ({p.currentStock})
                      </span>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span>FB: {p.channels.facebook}</span>
                        <span>Shopee: {p.channels.shopee}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              <span>Cảnh Báo Tồn Kho & Đồng Bộ Shopee</span>
            </h3>
            {totalAlerts > 0 && (
              <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-md font-bold">
                ⚠️ {totalAlerts} cảnh báo
              </span>
            )}
          </div>

          {loading || !inventoryAlerts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Critical */}
              {inventoryAlerts.critical.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">🔴 Nguy Hiểm (≤5 sp)</p>
                  {inventoryAlerts.critical.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/60 border border-red-200 rounded-lg mb-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">Tồn: <strong className="text-red-600 font-bold">{item.currentStock}</strong> · TB bán/ngày: {item.avgDailySales}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-red-600">Hết hàng trong ~{item.daysUntilOutOfStock} ngày</p>
                        <p className="text-xs text-slate-500 mt-0.5">Đề xuất nhập: {item.suggestedReorderQty} sp</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Low */}
              {inventoryAlerts.low.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">🟡 Cảnh Báo (≤20 sp)</p>
                  {inventoryAlerts.low.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200 rounded-lg mb-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">Tồn: <strong className="text-amber-700 font-bold">{item.currentStock}</strong> · TB bán/ngày: {item.avgDailySales}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-amber-700">~{item.daysUntilOutOfStock} ngày nữa hết</p>
                        <p className="text-xs text-slate-500 mt-0.5">Đề xuất nhập: {item.suggestedReorderQty} sp</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Overstock */}
              {inventoryAlerts.overstock.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">🟣 Tồn Quá Nhiều (&gt;90 ngày bán)</p>
                  {inventoryAlerts.overstock.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-purple-50/60 border border-purple-200 rounded-lg mb-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">Tồn: <strong className="text-purple-700 font-bold">{item.currentStock}</strong></p>
                      </div>
                      <div className="text-right text-xs text-purple-700 font-semibold">Cân nhắc giảm giá</div>
                    </div>
                  ))}
                </div>
              )}

              {inventoryAlerts.critical.length === 0 && inventoryAlerts.low.length === 0 && inventoryAlerts.overstock.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Tồn kho ổn định, không có cảnh báo nào.</p>
                </div>
              )}

              {/* Shopee Sync Status */}
              {inventoryAlerts.syncStatus.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Trạng Thái Đồng Bộ Shopee</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {inventoryAlerts.syncStatus.map((s) => (
                      <div key={s.productId} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[220px]">{s.name}</span>
                        <div className="flex items-center gap-3">
                          <span>Kho: <strong>{s.internalStock}</strong></span>
                          <span>Shopee: <strong>{s.shopeeStock ?? '—'}</strong></span>
                          <span className={`font-bold ${s.isSynced ? 'text-emerald-700' : 'text-red-600'}`}>
                            {s.isSynced ? '✅ Đồng bộ' : '❌ Lệch'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════ MULTI-MODEL FORECAST COMPARISON (SMA vs WMA vs EMA) ═══════════════════════ */}
      <ForecastComparisonWidget />

      {/* ═══════════════════════ CHAT CONVERSION FUNNEL ═══════════════════════ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
            <span>Phễu Chuyển Đổi Tin Nhắn & Hiệu Suất Phản Hồi</span>
          </h3>
        </div>

        {loading || !chatConversion ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funnel Steps */}
            <div className="lg:col-span-2 space-y-2.5">
              {[
                { label: 'Tổng Cuộc Hội Thoại', count: chatConversion.funnel.totalConversations, rate: '100%', color: 'bg-slate-400', widthPercent: 100 },
                { label: 'Hội Thoại Hoạt Động (≥2 tin)', count: chatConversion.funnel.activeConversations, rate: chatConversion.funnel.totalConversations > 0 ? `${((chatConversion.funnel.activeConversations / chatConversion.funnel.totalConversations) * 100).toFixed(1)}%` : '0%', color: 'bg-blue-500', widthPercent: chatConversion.funnel.totalConversations > 0 ? (chatConversion.funnel.activeConversations / chatConversion.funnel.totalConversations) * 100 : 0 },
                { label: 'Đơn Hàng Được Tạo', count: chatConversion.funnel.ordersCreated, rate: `${chatConversion.rates.chatToOrder}%`, color: 'bg-indigo-500', widthPercent: chatConversion.funnel.totalConversations > 0 ? (chatConversion.funnel.ordersCreated / chatConversion.funnel.totalConversations) * 100 : 0 },
                { label: 'Đã Thanh Toán (QR Code)', count: chatConversion.funnel.ordersPaid, rate: `${chatConversion.rates.orderToPaid}%`, color: 'bg-emerald-500', widthPercent: chatConversion.funnel.totalConversations > 0 ? (chatConversion.funnel.ordersPaid / chatConversion.funnel.totalConversations) * 100 : 0 },
                { label: 'Hoàn Tất Giao Hàng', count: chatConversion.funnel.ordersCompleted, rate: `${chatConversion.rates.paidToCompleted}%`, color: 'bg-green-600', widthPercent: chatConversion.funnel.totalConversations > 0 ? (chatConversion.funnel.ordersCompleted / chatConversion.funnel.totalConversations) * 100 : 0 },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-52 shrink-0">
                    <p className="text-xs font-bold text-slate-700">{step.label}</p>
                    <p className="text-sm font-bold text-slate-900">{step.count} <span className="text-xs font-semibold text-slate-400">({step.rate})</span></p>
                  </div>
                  <div className="flex-1 h-5.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.max(step.widthPercent, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics Summary */}
            <div className="space-y-3.5">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-700">⏱ Thời Gian Phản Hồi TB</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{chatConversion.avgResponseTime} phút</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700">🎯 Tỷ Lệ Chuyển Đổi Tổng</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{chatConversion.rates.overallConversion}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-sm">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Đánh giá hiệu suất
                </p>
                <p className="leading-relaxed">{chatConversion.insight}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
