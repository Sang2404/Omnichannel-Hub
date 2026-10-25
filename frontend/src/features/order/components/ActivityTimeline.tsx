import React from 'react';
import type { Order } from '../services/orderApi';
import { CheckCircle2, Clock, Zap, RefreshCw, Truck, MessageSquare, CreditCard } from 'lucide-react';

interface ActivityTimelineProps {
  order: Order;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ order }) => {
  const isPaid = order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'COMPLETED';
  const isShipped = order.status === 'SHIPPED' || order.status === 'COMPLETED';

  const steps = [
    {
      title: 'Tạo Đơn Hàng Mới',
      desc: `Đơn #${order.orderCode} được tạo từ kênh ${order.channel}`,
      time: new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      icon: Clock,
      status: 'completed',
    },
    {
      title: 'Tạo mã thanh toán QR',
      desc: `Đã sinh link thanh toán tự động ${order.payosPaymentId ? `(Mã GD: ${order.payosPaymentId})` : ''}`,
      time: new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      icon: CreditCard,
      status: 'completed',
    },
    {
      title: 'Thanh Toán Trực Tuyến',
      desc: isPaid ? 'Hệ thống đã nhận thanh toán thành công' : 'Chờ khách quét mã thanh toán...',
      time: isPaid ? 'Đã xác nhận' : 'Chờ xử lý',
      icon: Zap,
      status: isPaid ? 'completed' : 'pending',
    },
    {
      title: 'Cập Nhật Tồn Kho',
      desc: isPaid ? 'Đã khấu trừ số lượng sản phẩm trong kho' : 'Chờ thanh toán',
      time: isPaid ? 'Tự động' : 'Chờ xử lý',
      icon: CheckCircle2,
      status: isPaid ? 'completed' : 'pending',
    },
    {
      title: 'Đồng Bộ Tồn Kho Shopee',
      desc: isPaid ? 'Đã đồng bộ số lượng tồn kho lên sàn Shopee' : 'Chờ cập nhật kho',
      time: isPaid ? 'Tự động' : 'Chờ xử lý',
      icon: RefreshCw,
      status: isPaid ? 'completed' : 'pending',
    },
    {
      title: 'Tạo Vận Đơn Giao Hàng (GHN)',
      desc: isShipped
        ? `Đã khởi tạo đơn GHN thành công ${order.ghnOrderCode ? `(Mã: ${order.ghnOrderCode})` : ''}`
        : 'Chờ thanh toán để tạo vận đơn',
      time: isShipped ? 'Tự động' : 'Chờ xử lý',
      icon: Truck,
      status: isShipped ? 'completed' : 'pending',
    },
    {
      title: 'Gửi Thông Báo Vận Đơn Cho Khách',
      desc: isShipped ? 'Đã tự động gửi tin nhắn mã vận đơn cho khách qua Messenger' : 'Chờ tạo vận đơn',
      time: isShipped ? 'Tự động' : 'Chờ xử lý',
      icon: MessageSquare,
      status: isShipped ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Tiến trình xử lý đơn hàng
        </h4>
        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
          Tự động hóa
        </span>
      </div>

      <div className="relative pl-4 space-y-4 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = step.status === 'completed';
          return (
            <div key={idx} className="relative flex items-start gap-3 text-xs">
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] ${
                  isDone
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                <Icon className="h-3 w-3" />
              </div>
              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
