import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ExternalLink, RefreshCw, X } from 'lucide-react';
import { axiosClient } from '../../../core/api/axiosClient';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  psid?: string;
  customTag?: string | null;
  createdAt: string;
  orders?: any[];
  _count?: {
    orders: number;
  };
  rfm?: {
    recencyDays: number | null;
    frequency: number;
    monetary: number;
    segment: string;
    segmentLabel: string;
    autoSegment?: string;
    autoSegmentLabel?: string;
    isManual?: boolean;
  };
}

export const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res: any = await axiosClient.get('/customers');
      const list = res?.data?.customers || res?.customers || res?.data || (Array.isArray(res) ? res : []);
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    const matchesSegment =
      selectedSegment === 'ALL' || c.rfm?.segment === selectedSegment;

    return matchesSearch && matchesSegment;
  });

  const vipCount = customers.filter((c) => c.rfm?.segment === 'VIP').length;
  const orderedCount = customers.filter((c) => c.rfm?.segment === 'ORDERED').length;
  const warningCount = customers.filter((c) => c.rfm?.segment === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* ────────────────── WORKSPACE HEADER (OPERATE MODE) ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
            <span>Bình Dương Store</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Khách hàng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Quản Lý & Phân Loại Khách Hàng
          </h1>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ────────────────── UNIFIED METRICS STRIP (OPERATE MODE) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Tổng khách hàng</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading ? (
              <span className="inline-block h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              `${customers.length} khách`
            )}
          </div>
          <div className="mt-2 text-sm text-slate-500">Từ Facebook Messenger</div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Khách hàng VIP</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading ? (
              <span className="inline-block h-8 w-20 bg-slate-100 rounded animate-pulse" />
            ) : (
              `${vipCount} khách`
            )}
          </div>
          <div className="mt-2 text-sm text-slate-500">Chi tiêu {'>'} 1Tr hoặc mua {'>='} 3 đơn</div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Khách đã mua</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading ? (
              <span className="inline-block h-8 w-20 bg-slate-100 rounded animate-pulse" />
            ) : (
              `${orderedCount} khách`
            )}
          </div>
          <div className="mt-2 text-sm text-slate-500">Đã phát sinh đơn hàng thành công</div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-500">Cảnh báo boom</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading ? (
              <span className="inline-block h-8 w-20 bg-slate-100 rounded animate-pulse" />
            ) : (
              `${warningCount} khách`
            )}
          </div>
          <div className="mt-2 text-sm text-slate-500">Lịch sử hủy đơn / rủi ro</div>
        </div>
      </div>

      {/* Filter & Search Bar with Segment Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên khách hàng, số điện thoại, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Customer Segment Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'VIP', label: 'Khách VIP' },
              { id: 'ORDERED', label: 'Khách đã mua' },
              { id: 'NEW', label: 'Khách mới' },
              { id: 'WARNING', label: 'Cảnh báo boom' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSegment(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSegment === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-3.5">Khách Hàng</th>
                <th className="py-3 px-3">Số Điện Thoại</th>
                <th className="py-3 px-3">Địa Chỉ</th>
                <th className="py-3 px-3 text-center">Kênh</th>
                <th className="py-3 px-3 text-center">Đơn Hàng / Doanh Số</th>
                <th className="py-3 px-3 text-center">Phân Khúc</th>
                <th className="py-3 px-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <UserCheck className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-base">Chưa có khách hàng nào</p>
                        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                          Khách hàng sẽ được tự động tạo khi nhận tin nhắn từ Facebook Messenger hoặc khi tạo đơn hàng mới.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const orderCount = c._count?.orders || c.orders?.length || 1;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-tight">{c.name}</p>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {c.id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-mono text-sm text-slate-800 tabular-nums font-medium">{c.phone}</p>
                          {c.email && (
                            <p className="text-xs text-slate-400">{c.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 text-sm max-w-[200px]">
                        <span className="truncate block" title={c.address || undefined}>{c.address || '—'}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {c.psid ? 'Messenger' : 'Facebook'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div>
                          <span className="font-semibold text-slate-900 text-sm tabular-nums">
                            {orderCount} đơn
                          </span>
                          {c.rfm?.monetary !== undefined && (
                            <p className="text-xs text-slate-500 font-mono tabular-nums">
                              {c.rfm.monetary.toLocaleString('vi-VN')}đ
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {(() => {
                          const seg = c.rfm?.segment;
                          const label = c.rfm?.segmentLabel || 'Khách mới';
                          const isManual = c.rfm?.isManual;

                          let colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
                          if (seg === 'VIP') colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
                          else if (seg === 'WARNING') colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
                          else if (seg === 'ORDERED') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          else if (seg === 'NEW') colorClass = 'bg-blue-50 text-blue-700 border-blue-200';

                          return (
                            <div className="inline-flex flex-col items-center gap-0.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
                                {label}
                              </span>
                              {isManual && (
                                <span className="text-[9px] text-slate-400 font-medium">thủ công</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Lịch sử</span>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Orders Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedCustomer.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
                <p className="text-slate-600 text-sm">
                  <span className="font-semibold text-slate-900">Địa chỉ giao hàng:</span>{' '}
                  {selectedCustomer.address || 'Thủ Dầu Một, Bình Dương'}
                </p>
                <p className="text-slate-600 text-sm">
                  <span className="font-semibold text-slate-900">Kênh tương tác:</span> Facebook Messenger
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm pt-2">Lịch Sử Đơn Hàng Đã Đặt:</h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  selectedCustomer.orders.map((o: any) => (
                    <div key={o.id} className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between bg-white">
                      <div>
                        <span className="font-bold text-blue-600 text-sm">#{o.orderCode || o.id.slice(0, 8)} ({o.channel})</span>
                        <p className="text-xs text-slate-500 mt-0.5">Trạng thái: {o.status}</p>
                      </div>
                      <span className="font-bold text-emerald-600 text-sm">{o.totalAmount?.toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 text-center">Chưa có lịch sử đơn hàng</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
