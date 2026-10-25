import React, { useState, useEffect } from 'react';
import { orderApi, type Order, type OrderStatus } from '../services/orderApi';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { PayOSQRModal } from '../components/PayOSQRModal';
import { GHNLabelModal } from '../components/GHNLabelModal';
import { ShoppingBag, Search, QrCode, Truck, RefreshCw, Eye, X, Download, Ban, CheckCircle2 } from 'lucide-react';

export const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modals state
  const [qrModalOrder, setQrModalOrder] = useState<Order | null>(null);
  const [ghnModalOrder, setGhnModalOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrders(selectedStatus);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).orders || [];
        setOrders(list);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'CANCELLED' && !window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Hệ thống sẽ hoàn lại tồn kho nếu đơn đã thanh toán.')) {
      return;
    }
    setActionLoading(true);
    try {
      await orderApi.updateStatus(orderId, newStatus);
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(o.orderCode).includes(searchQuery)
  );

  const statusBadges: Record<OrderStatus, { label: string; class: string }> = {
    PENDING_PAYMENT: { label: 'Chờ Quét QR', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    PAID: { label: 'Đã Thanh Toán', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    PROCESSING: { label: 'Đang Chuẩn Bị Hàng', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    SHIPPED: { label: 'Đang giao hàng', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    COMPLETED: { label: 'Hoàn Tất', class: 'bg-green-50 text-green-700 border-green-200' },
    CANCELLED: { label: 'Đã Hủy', class: 'bg-red-50 text-red-700 border-red-200' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi, xử lý đơn hàng đa kênh và vận chuyển.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const headers = ['Mã Đơn', 'Khách Hàng', 'SĐT', 'Kênh', 'Tổng Tiền (VNĐ)', 'Trạng Thái', 'Ngày Tạo'];
              const rows = filteredOrders.map(o => [
                `#${o.orderCode || o.id.slice(0, 8)}`,
                `"${o.customer.name}"`,
                `"${o.customer.phone || ''}"`,
                o.channel,
                o.totalAmount,
                o.status,
                new Date(o.createdAt).toLocaleDateString('vi-VN')
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `Bao_Cao_Don_Hang_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Tải báo cáo (CSV)</span>
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
          {[
            { id: '', label: 'Tất cả đơn' },
            { id: 'PENDING_PAYMENT', label: 'Chờ Quét QR' },
            { id: 'PAID', label: 'Đã Thanh Toán' },
            { id: 'SHIPPED', label: 'Đang giao' },
            { id: 'COMPLETED', label: 'Hoàn Tất' },
            { id: 'CANCELLED', label: 'Đã Hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-semibold transition-colors shrink-0 ${selectedStatus === tab.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn (#1) hoặc tên khách..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            <span>Đang tải danh sách đơn hàng...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã đơn</th>
                  <th className="py-3.5 px-5">Kênh bán</th>
                  <th className="py-3.5 px-5">Khách hàng</th>
                  <th className="py-3.5 px-5">Tổng tiền</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5">Vận đơn GHN</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((o) => {
                  const badge = statusBadges[o.status] || { label: o.status, class: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-slate-900">#{o.orderCode}</td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded ${o.channel === 'FACEBOOK'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}
                        >
                          {o.channel}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-800">{o.customer.name}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">{o.totalAmount.toLocaleString('vi-VN')}đ</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 text-xs font-bold border rounded ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-slate-600">
                        {o.ghnOrderCode ? (
                          <span className="text-emerald-700 font-bold">{o.ghnOrderCode}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Chờ giao</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => setQrModalOrder(o)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                          title="Mã thanh toán QR"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setGhnModalOrder(o)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                          title="In Nhãn GHN"
                        >
                          <Truck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          title="Chi tiết đơn hàng"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-slate-500">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <span>Chưa có đơn hàng nào trong trạng thái này.</span>
          </div>
        )}
      </div>

      {/* Selected Order Detail & Activity Timeline Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Chi Tiết Đơn Hàng #{selectedOrder.orderCode}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ngày tạo: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Customer and Delivery Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Thông tin nhận hàng</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p>Khách hàng: <strong className="text-slate-900">{selectedOrder.customer.name}</strong></p>
                  <p>Số điện thoại: <strong className="text-slate-900">{selectedOrder.customer.phone || 'Chưa cập nhật'}</strong></p>
                  <p className="col-span-2">Địa chỉ giao: <strong className="text-slate-900">{selectedOrder.customer.address || 'Chưa cập nhật'}</strong></p>
                  <p>Kênh bán: <strong className="text-slate-900">{selectedOrder.channel}</strong></p>
                  <p>Mã vận đơn: <strong className="text-slate-900">{selectedOrder.ghnOrderCode || 'Chưa có'}</strong></p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sản phẩm ({selectedOrder.items.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.product.name}</p>
                        <p className="text-slate-500 font-mono mt-0.5">SKU: {item.product.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{item.price.toLocaleString('vi-VN')}đ</span>
                        <p className="text-slate-500 mt-0.5">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Tiền hàng:</span>
                    <span>{(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0)).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển:</span>
                    <span>{(selectedOrder.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Tổng thanh toán:</span>
                    <span className="text-blue-600">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              {/* Quick Status / Cancel Action (B4) */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Trạng thái: {statusBadges[selectedOrder.status]?.label || selectedOrder.status}</span>
                  {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                      disabled={actionLoading}
                      className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Ban className="h-3 w-3" />
                      <span>Hủy đơn</span>
                    </button>
                  )}
                </div>
                {selectedOrder.status === 'PENDING_PAYMENT' && (
                  <p className="text-[11px] text-amber-700">Khách hàng chưa thanh toán. Có thể quét mã QR hoặc hủy đơn nếu khách đổi ý.</p>
                )}
                {selectedOrder.status === 'PAID' && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã thanh toán qua VietQR. Kho hàng đã được khấu trừ an toàn.
                  </p>
                )}
              </div>

              {/* Activity Timeline */}
              <ActivityTimeline order={selectedOrder} />
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PayOS VietQR Modal */}
      {qrModalOrder && (
        <PayOSQRModal
          isOpen={!!qrModalOrder}
          onClose={() => setQrModalOrder(null)}
          orderCode={qrModalOrder.orderCode}
          amount={qrModalOrder.totalAmount}
          customerName={qrModalOrder.customer.name}
          onSuccess={fetchOrders}
        />
      )}

      {/* GHN Label Print Modal */}
      {ghnModalOrder && (
        <GHNLabelModal
          isOpen={!!ghnModalOrder}
          onClose={() => setGhnModalOrder(null)}
          orderCode={ghnModalOrder.orderCode}
          ghnOrderCode={ghnModalOrder.ghnOrderCode}
          customerName={ghnModalOrder.customer.name}
          phone={ghnModalOrder.customer.phone}
          address={ghnModalOrder.customer.address}
        />
      )}
    </div>
  );
};
