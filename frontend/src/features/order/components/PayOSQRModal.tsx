import React, { useState } from 'react';
import { X, QrCode, Copy, Download, Check, Zap, Loader2 } from 'lucide-react';
import { axiosClient } from '../../../core/api/axiosClient';

interface PayOSQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: number;
  amount: number;
  customerName: string;
  onSuccess?: () => void;
}

export const PayOSQRModal: React.FC<PayOSQRModalProps> = ({
  isOpen,
  onClose,
  orderCode,
  amount,
  customerName,
  onSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

  if (!isOpen) return null;

  const paymentUrl = `https://payos.vn/checkout/${orderCode}`;
  const vietQrImage = `https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=${amount}&addInfo=TDMU${orderCode}%20thanh%20toan&accountName=OMNICHANNEL%20HUB`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      // Trigger PayOS payment success callback webhook
      await axiosClient.post('/webhooks/payos', {
        code: '00',
        desc: 'success',
        data: {
          orderCode,
          amount,
          paymentLinkId: `SIMULATED_PAYOS_TX_${Date.now()}`,
        },
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to simulate payment:', err);
      alert('Không thể mô phỏng thanh toán. Vui lòng kiểm tra lại backend.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <QrCode className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Mã QR Thanh Toán - Đơn #{orderCode}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <img src={vietQrImage} alt="VietQR Code" className="w-52 h-52 object-contain" />
          </div>

          <div>
            <p className="text-2xl font-bold text-slate-900">{amount.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm text-slate-600 mt-1">Nội dung CK: <strong className="text-slate-900 font-mono font-bold">TDMU{orderCode} thanh toan</strong></p>
            <p className="text-xs text-slate-500 mt-1">Khách hàng: <span className="font-semibold text-slate-700">{customerName}</span></p>
          </div>

          <div className="w-full pt-1 grid grid-cols-2 gap-2.5 text-sm font-semibold">
            <button
              onClick={handleCopy}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Đã Sao Chép' : 'Sao chép link'}</span>
            </button>
            <a
              href={vietQrImage}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Tải Mã QR</span>
            </a>
          </div>

          {/* Test Sandbox Simulation Action */}
          <div className="w-full pt-3 border-t border-slate-100">
            <button
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>{simulating ? 'Đang xử lý...' : 'Xác nhận thanh toán'}</span>
            </button>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Xác nhận đơn hàng đã thanh toán thành công để cập nhật tồn kho và tạo vận đơn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
