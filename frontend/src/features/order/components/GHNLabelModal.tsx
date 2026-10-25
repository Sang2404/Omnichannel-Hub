import React from 'react';
import { X, Printer, Truck, PackageCheck, Barcode } from 'lucide-react';

interface GHNLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: number;
  ghnOrderCode?: string;
  customerName: string;
  phone?: string;
  address?: string;
}

export const GHNLabelModal: React.FC<GHNLabelModalProps> = ({
  isOpen,
  onClose,
  orderCode,
  ghnOrderCode = 'GHN_SHP_999901',
  customerName,
  phone = '0987654321',
  address = 'Thu Dau Mot, Binh Duong',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Truck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Phiếu Giao Hàng Nhanh (GHN Express)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Label Section */}
        <div className="p-6 space-y-4 text-sm" id="printable-ghn-label">
          {/* Label Header */}
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-base">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              <span>GIAO HÀNG NHANH (GHN EXPRESS)</span>
            </div>
            <div className="py-3 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center">
              <Barcode className="h-12 w-56 text-slate-900" />
              <span className="font-mono font-bold text-slate-900 text-sm tracking-widest mt-1.5">{ghnOrderCode}</span>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-2.5 border-t border-slate-200 pt-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mã Đơn Shop:</span>
                <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">#{orderCode}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Dịch Vụ:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">GHN Tiêu Chuẩn</p>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Người Nhận:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{customerName} - {phone}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{address}</p>
            </div>
          </div>

          {/* Footer Print Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="h-4.5 w-4.5" />
              <span>In Phiếu Giao Hàng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
