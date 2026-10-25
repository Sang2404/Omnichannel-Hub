import React, { useState, useEffect } from 'react';
import { analyticsApi, type InventoryForecast } from '../services/analyticsApi';
import { productApi, type Product } from '../../product/services/productApi';
import { Brain, Award, Activity, TrendingDown, Calendar, RefreshCw, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ForecastComparisonWidget: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [forecastData, setForecastData] = useState<InventoryForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingForecast, setFetchingForecast] = useState<boolean>(false);

  useEffect(() => {
    productApi.getProducts().then((res) => {
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).products || [];
        setProducts(list);
        if (list.length > 0) {
          setSelectedProductId(list[0].id);
        }
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;
    setFetchingForecast(true);
    analyticsApi
      .getInventoryForecast(selectedProductId, 30)
      .then((res) => {
        if (res.success && res.data) {
          setForecastData(res.data);
        }
      })
      .catch((err) => console.error('Failed to load forecast', err))
      .finally(() => setFetchingForecast(false));
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  const comparison = forecastData?.modelsComparison;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      {/* HEADER & PRODUCT SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Dự Báo Nhu Cầu Tồn Kho (SMA, WMA, EMA)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                So sánh độ chính xác giữa các thuật toán dựa trên chỉ số sai số MAPE & RMSE
              </p>
            </div>
          </div>
        </div>

        {/* Product Dropdown Selector */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-slate-700">Sản phẩm:</span>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.sku}] {p.name} (Tồn: {p.stock})
              </option>
            ))}
          </select>
          {fetchingForecast && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />}
        </div>
      </div>

      {/* 3 MODELS COMPARISON CARDS */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. SMA */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              comparison.recommendedModel === 'SMA'
                ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">{comparison.sma.name}</span>
              {comparison.recommendedModel === 'SMA' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" /> Tối ưu nhất
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3.5">{comparison.sma.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">TB bán/ngày:</span>
                <strong className="text-slate-900">{comparison.sma.avgDailySales} sp</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sai số MAPE:</span>
                <strong className="text-blue-700 font-bold">{comparison.sma.mape}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sai số RMSE:</span>
                <strong className="text-slate-800 font-bold">{comparison.sma.rmse}</strong>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">Dự báo hết hàng:</span>
                <span className="font-bold text-slate-700">~{comparison.sma.projectedOutOfStockDays} ngày</span>
              </div>
            </div>
          </div>

          {/* 2. WMA */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              comparison.recommendedModel === 'WMA'
                ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-400/20 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">{comparison.wma.name}</span>
              {comparison.recommendedModel === 'WMA' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" /> Tối ưu nhất
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3.5">{comparison.wma.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">TB bán/ngày:</span>
                <strong className="text-slate-900">{comparison.wma.avgDailySales} sp</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sai số MAPE:</span>
                <strong className="text-indigo-700 font-bold">{comparison.wma.mape}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sai số RMSE:</span>
                <strong className="text-slate-800 font-bold">{comparison.wma.rmse}</strong>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">Dự báo hết hàng:</span>
                <span className="font-bold text-slate-700">~{comparison.wma.projectedOutOfStockDays} ngày</span>
              </div>
            </div>
          </div>

          {/* 3. EMA */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              comparison.recommendedModel === 'EMA'
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">{comparison.ema.name}</span>
              {comparison.recommendedModel === 'EMA' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" /> Tối ưu nhất
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3.5">{comparison.ema.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">TB bán/ngày:</span>
                <strong className="text-slate-900">{comparison.ema.avgDailySales} sp</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sai số MAPE:</span>
                <strong className="text-emerald-700 font-bold">{comparison.ema.mape}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sai số RMSE:</span>
                <strong className="text-slate-800 font-bold">{comparison.ema.rmse}</strong>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">Dự báo hết hàng:</span>
                <span className="font-bold text-slate-700">~{comparison.ema.projectedOutOfStockDays} ngày</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL RECOMMENDATION BOX */}
      {comparison && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-indigo-200/70 rounded-xl flex items-start gap-3.5">
          <Award className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-indigo-950 mb-1 text-sm">
              Khuyến nghị lựa chọn mô hình tối ưu:
            </p>
            <p className="text-indigo-900/90 leading-relaxed text-sm">
              {comparison.academicExplanation}
            </p>
          </div>
        </div>
      )}

      {/* 30-DAY INVENTORY DRAWDOWN PROJECTION CHART */}
      {forecastData?.forecast && forecastData.forecast.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <TrendingDown className="w-4.5 h-4.5 text-rose-500" />
              Đồ thị suy giảm tồn kho dự phóng 30 ngày tới ({forecastData.product.name})
            </span>
            {forecastData.outOfStockDate && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                🚨 Dự kiến cạn kho: {forecastData.outOfStockDate}
              </span>
            )}
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData.forecast} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 10 }}
                  formatter={(val: any) => [`${val} sản phẩm`, 'Tồn kho dự báo']}
                  labelFormatter={(lbl) => `Ngày: ${lbl}`}
                />
                <Area type="monotone" dataKey="predictedStock" stroke="#6366f1" strokeWidth={2} fill="url(#colorStock)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
