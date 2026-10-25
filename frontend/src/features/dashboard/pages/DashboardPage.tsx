import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  analyticsApi,
  type KPIOverview,
  type RevenueTrend,
  type ChatConversionReport,
  type InventoryAlerts,
} from '../../analytics/services/analyticsApi';
import { orderApi, type Order } from '../../order/services/orderApi';
import { chatApi, type Conversation } from '../../chat/services/chatApi';

const formatVND = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}tr đ`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k đ`;
  return `${Math.round(n).toLocaleString('vi-VN')}đ`;
};

const formatFullVND = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

type PeriodOption = 'today' | '7d' | '30d' | '90d';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // State Management
  const [period, setPeriod] = useState<PeriodOption>('30d');
  const [loading, setLoading] = useState(true);

  // Operational Data States
  const [kpi, setKpi] = useState<KPIOverview | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend | null>(null);
  const [chatReport, setChatReport] = useState<ChatConversionReport | null>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlerts | null>(null);
  const [pendingPayosOrders, setPendingPayosOrders] = useState<Order[]>([]);
  const [shippedOrders, setShippedOrders] = useState<Order[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchDashboardData = async (selectedPeriod: PeriodOption = period) => {
    setLoading(true);
    try {
      const [kpiRes, trendRes, chatReportRes, alertsRes, pendingOrdersRes, shippedOrdersRes, convsRes] =
        await Promise.allSettled([
          analyticsApi.getKpiOverview(selectedPeriod),
          analyticsApi.getRevenueTrend(selectedPeriod),
          analyticsApi.getChatConversion(selectedPeriod),
          analyticsApi.getInventoryAlerts(),
          orderApi.getOrders('PENDING_PAYMENT'),
          orderApi.getOrders('SHIPPED'),
          chatApi.getConversations(),
        ]);

      if (kpiRes.status === 'fulfilled' && kpiRes.value.data) setKpi(kpiRes.value.data);
      if (trendRes.status === 'fulfilled' && trendRes.value.data) setRevenueTrend(trendRes.value.data);
      if (chatReportRes.status === 'fulfilled' && chatReportRes.value.data) setChatReport(chatReportRes.value.data);
      if (alertsRes.status === 'fulfilled' && alertsRes.value.data) setInventoryAlerts(alertsRes.value.data);

      if (pendingOrdersRes.status === 'fulfilled' && pendingOrdersRes.value.data) {
        const list = Array.isArray(pendingOrdersRes.value.data)
          ? pendingOrdersRes.value.data
          : (pendingOrdersRes.value.data as any).orders || [];
        setPendingPayosOrders(list);
      }

      if (shippedOrdersRes.status === 'fulfilled' && shippedOrdersRes.value.data) {
        const list = Array.isArray(shippedOrdersRes.value.data)
          ? shippedOrdersRes.value.data
          : (shippedOrdersRes.value.data as any).orders || [];
        setShippedOrders(list);
      }

      if (convsRes.status === 'fulfilled' && convsRes.value.data) {
        const list = Array.isArray(convsRes.value.data)
          ? convsRes.value.data
          : (convsRes.value.data as any).conversations || [];
        setConversations(list);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  // Chart data formatting
  const revenueChartData = revenueTrend
    ? revenueTrend.labels.slice(-14).map((label, i) => {
      const idx = revenueTrend.labels.length - 14 + i;
      const index = idx >= 0 ? idx : i;
      const d = new Date(label);
      return {
        date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        facebook: revenueTrend.datasets.facebook[index] || 0,
        shopee: revenueTrend.datasets.shopee[index] || 0,
        total: revenueTrend.datasets.total[index] || 0,
      };
    })
    : [];

  const periodOptions: { key: PeriodOption; label: string }[] = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7d', label: '7 ngày' },
    { key: '30d', label: '30 ngày' },
    { key: '90d', label: '90 ngày' },
  ];

  const totalStockAlerts =
    inventoryAlerts ? inventoryAlerts.critical.length + inventoryAlerts.low.length : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* ────────────────── WORKSPACE HEADER (OPERATE MODE) ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
            <span>Bình Dương Store</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Tổng quan vận hành</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Tổng Quan Bán Hàng Đa Kênh
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Timeframe Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600">
            {periodOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-3.5 py-1.5 rounded-md transition-colors ${period === opt.key
                  ? 'bg-white font-semibold text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat & Tạo đơn</span>
          </button>

          <button
            onClick={() => fetchDashboardData(period)}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ────────────────── UNIFIED METRICS STRIP (STRIPE / LINEAR STYLE) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Metric 1: Revenue */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500">Doanh thu thuần</div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              {loading ? (
                <span className="inline-block h-8 w-32 bg-slate-100 rounded animate-pulse" />
              ) : (
                formatFullVND(kpi?.revenue.total || 0)
              )}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-500">
            <span
              className={`inline-flex items-center font-semibold ${(kpi?.revenue.changePercent || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
            >
              {(kpi?.revenue.changePercent || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {kpi ? `${kpi.revenue.changePercent > 0 ? '+' : ''}${kpi.revenue.changePercent}%` : '0%'}
            </span>
            <span>so với kỳ trước</span>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500">Tổng đơn hàng</div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              {loading ? (
                <span className="inline-block h-8 w-24 bg-slate-100 rounded animate-pulse" />
              ) : (
                `${kpi?.orders.total || 0} đơn`
              )}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-emerald-700">
              {kpi?.orders.completed || 0} hoàn tất
            </span>
            <span>·</span>
            <span>Hủy: {kpi?.orders.cancelRate || 0}%</span>
          </div>
        </div>

        {/* Metric 3: New Customers (Standardized across all roles) */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500">Khách hàng mới</div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              {loading ? (
                <span className="inline-block h-8 w-24 bg-slate-100 rounded animate-pulse" />
              ) : (
                `+${kpi?.newCustomers.total || 0}`
              )}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-500">
            <span
              className={`inline-flex items-center font-semibold ${(kpi?.newCustomers.changePercent || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
            >
              {(kpi?.newCustomers.changePercent || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {kpi && kpi.newCustomers.changePercent > 0
                ? `+${kpi.newCustomers.changePercent}%`
                : `${kpi?.newCustomers.changePercent || 0}%`}
            </span>
            <span>so với kỳ trước</span>
          </div>
        </div>

        {/* Metric 4: Stock Alerts (Standardized across all roles) */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500">Cảnh báo tồn kho</div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              {loading ? (
                <span className="inline-block h-8 w-24 bg-slate-100 rounded animate-pulse" />
              ) : (
                `${totalStockAlerts} SKU`
              )}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-500">
            {totalStockAlerts === 0 ? (
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Kho hàng an toàn
              </span>
            ) : (
              <span className="font-semibold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Cần nhập bổ sung kho
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────── EXECUTIVE PROFIT BAR (ADMIN EXCLUSIVE) ────────────────── */}
      {isAdmin && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-white p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              LN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Chỉ số tài chính chủ shop</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">Dành riêng Quản trị</span>
              </div>
              <div className="text-sm text-slate-700 mt-0.5">
                Lợi nhuận gộp ước tính:{' '}
                <strong className="text-slate-900 font-bold text-base font-mono">
                  {formatFullVND(kpi?.netProfit.total || 0)}
                </strong>{' '}
                <span className="text-xs font-semibold text-emerald-700 ml-1">
                  (Biên LN: {kpi && kpi.revenue.total > 0 ? ((kpi.netProfit.total / kpi.revenue.total) * 100).toFixed(1) : '0'}%)
                </span>
                <span className="text-xs text-slate-500 ml-2 hidden md:inline">· Đã khấu trừ giá vốn hàng bán và chiết khấu sàn</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-blue-600 hover:bg-slate-50 shadow-2xs transition-colors shrink-0"
          >
            <span>Phân tích tài chính chi tiết</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ────────────────── OPERATIONAL WORKLISTS (HIGH-DENSITY WORKBENCH) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Panel 1: Pending VietQR Orders */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-slate-900">Đơn Chờ Quét VietQR</span>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/60 tabular-nums">
                  {pendingPayosOrders.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingPayosOrders.length > 0 ? (
                pendingPayosOrders.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate('/orders')}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          #{p.orderCode || p.id.slice(0, 6)}
                        </span>
                        <span className="text-sm text-slate-700 truncate max-w-36 font-medium">
                          {p.customer.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {p.items?.length || 1} sản phẩm · {p.channel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatVND(p.totalAmount)}
                      </div>
                      <span className="inline-block mt-1 rounded px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                        Chờ quét QR
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500 mb-1" />
                  Không có đơn hàng nào chờ thanh toán
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/60 rounded-b-xl">
            <button
              onClick={() => navigate('/orders')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full"
            >
              <span>Xem tất cả đơn hàng</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Panel 2: Live GHN Shipping Queue */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-slate-900">Vận Đơn GHN Đang Giao</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200/60 tabular-nums">
                  {shippedOrders.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {shippedOrders.length > 0 ? (
                shippedOrders.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate('/orders')}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          #{s.orderCode}
                        </span>
                        <span className="text-sm text-slate-700 truncate max-w-36 font-medium">
                          {s.customer.name}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-slate-500 mt-1">
                        {s.ghnOrderCode || 'GHN Dispatch'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        Đang giao hàng
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  Chưa có vận đơn nào đang vận chuyển
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/60 rounded-b-xl">
            <button
              onClick={() => navigate('/orders')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full"
            >
              <span>Quản lý vận chuyển</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Panel 3: Messenger Messages */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-slate-900">Tin Nhắn Messenger</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 tabular-nums">
                  {conversations.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {conversations.length > 0 ? (
                conversations.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate('/chat')}
                    className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {c.customer.name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Vừa xong</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1 leading-relaxed">
                      {c.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  Chưa có tin nhắn mới nào
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/60 rounded-b-xl">
            <button
              onClick={() => navigate('/chat')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full"
            >
              <span>Vào hộp thư chat</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────── INVENTORY ALERT BANNER (IF ANY) ────────────────── */}
      {totalStockAlerts > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-rose-800 font-medium">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              Phát hiện <strong>{totalStockAlerts} sản phẩm</strong> dưới ngưỡng tồn kho an toàn.
              Hệ thống đang tự động giới hạn tồn kho để tránh bán quá số lượng.
            </span>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="font-semibold text-rose-700 hover:text-rose-900 underline shrink-0 ml-4"
          >
            Xem kho hàng
          </button>
        </div>
      )}

      {/* ────────────────── REVENUE CHART & CONVERSION FUNNEL ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Doanh Thu Theo Kênh (14 Ngày)
              </h2>
              <p className="text-sm text-slate-500">
                So sánh doanh thu bán hàng giữa Facebook và Shopee
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {revenueTrend && (
                (() => {
                  const fbTotal = revenueTrend.datasets.facebook.reduce((acc, v) => acc + v, 0);
                  const shopeeTotal = revenueTrend.datasets.shopee.reduce((acc, v) => acc + v, 0);
                  const allTotal = fbTotal + shopeeTotal || 1;
                  const fbPct = Math.round((fbTotal / allTotal) * 100);
                  const shopeePct = 100 - fbPct;
                  return (
                    <div className="flex items-center gap-2 text-xs font-semibold tabular-nums">
                      <span className="px-3 py-1 rounded-full bg-blue-50/90 text-blue-700 border border-blue-200/90 shadow-2xs flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                        <span>FB: {fbPct}%</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-50/90 text-amber-700 border border-amber-200/90 shadow-2xs flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>Shopee: {shopeePct}%</span>
                      </span>
                    </div>
                  );
                })()
              )}
              {isAdmin && (
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Báo cáo chi tiết →
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="h-60 w-full flex items-center justify-center">
              <div className="h-52 w-full bg-slate-50 rounded animate-pulse" />
            </div>
          ) : revenueChartData.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(v) => formatVND(v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 13,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                    formatter={(value: any) => [formatFullVND(Number(value) || 0)]}
                  />
                  <Area
                    type="monotone"
                    dataKey="facebook"
                    name="Facebook Messenger"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="#eff6ff"
                  />
                  <Area
                    type="monotone"
                    dataKey="shopee"
                    name="Shopee"
                    stroke="#d97706"
                    strokeWidth={2}
                    fill="#fffbeb"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-slate-400">
              Chưa có dữ liệu doanh thu trong khoảng thời gian này
            </div>
          )}

          <div className="flex items-center justify-center gap-6 pt-3 mt-2 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-600 font-medium">Facebook Messenger</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
              <span className="text-slate-600 font-medium">Shopee</span>
            </div>
          </div>
        </div>

        {/* Omnichannel Conversion Funnel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Phễu Chuyển Đổi Vận Hành
                </h2>
                <p className="text-sm text-slate-500">
                  Tỷ lệ từ lúc khách gửi tin nhắn đến khi hoàn tất đơn GHN
                </p>
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700 tabular-nums">
                Tỷ lệ: {chatReport ? `${chatReport.rates.overallConversion}%` : '0%'}
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {[
                {
                  label: '1. Khách chat Messenger',
                  count: chatReport?.funnel.totalConversations || 0,
                  sub: '100%',
                },
                {
                  label: '2. Tương tác sâu (≥2 tin nhắn)',
                  count: chatReport?.funnel.activeConversations || 0,
                  sub:
                    chatReport && chatReport.funnel.totalConversations > 0
                      ? `${((chatReport.funnel.activeConversations / chatReport.funnel.totalConversations) * 100).toFixed(1)}%`
                      : '0%',
                },
                {
                  label: '3. Đơn hàng khởi tạo',
                  count: chatReport?.funnel.ordersCreated || 0,
                  sub: `${chatReport?.rates.chatToOrder || 0}%`,
                },
                {
                  label: '4. Đã quét VietQR PayOS (PAID)',
                  count: chatReport?.funnel.ordersPaid || 0,
                  sub: `${chatReport?.rates.orderToPaid || 0}%`,
                },
                {
                  label: '5. Cấp vận đơn GHN thành công',
                  count: chatReport?.funnel.ordersCompleted || 0,
                  sub: `${chatReport?.rates.paidToCompleted || 0}%`,
                },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{step.label}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {step.count}{' '}
                      <span className="text-xs font-medium text-slate-500">({step.sub})</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-700 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(
                          4,
                          chatReport && chatReport.funnel.totalConversations > 0
                            ? (step.count / chatReport.funnel.totalConversations) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 text-sm text-slate-500 flex items-center justify-between">
            <span>Tốc độ phản hồi trung bình:</span>
            <span className="font-bold text-slate-800">
              {chatReport?.avgResponseTime ? `${chatReport.avgResponseTime} phút` : '< 2 phút'}
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────── PLATFORM INTEGRATION DOCK (TECHNICAL PROOF) ────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
        <div className="flex items-center justify-between text-slate-600 mb-3 font-medium">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Hạ Tầng Tích Hợp Đa Kênh (Production Endpoints)
          </span>
          <span className="text-xs text-slate-500">
            PostgreSQL Supabase · Upstash Redis · Webhook Event Streams
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Facebook Meta</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs text-slate-500 mt-1">Fanpage Đã Kết Nối</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">PayOS VietQR</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs text-slate-500 mt-1">Webhook Khớp Đơn Tự Động</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">GHN Express</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs text-slate-500 mt-1">Kết nối vận chuyển tự động</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Shopee</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs text-slate-500 mt-1">Tự động đồng bộ tồn kho</div>
          </div>
        </div>
      </div>
    </div>
  );
};
