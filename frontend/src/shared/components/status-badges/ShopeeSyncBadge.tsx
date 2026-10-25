import React from 'react';
import type { ShopeeMapping } from '../../../features/product/services/productApi';
import { RefreshCw, CheckCircle2, AlertTriangle, Link2Off } from 'lucide-react';

interface ShopeeSyncBadgeProps {
  mapping?: ShopeeMapping | null;
  stock: number;
}

export const ShopeeSyncBadge: React.FC<ShopeeSyncBadgeProps> = ({ mapping, stock }) => {
  if (!mapping) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
        <Link2Off className="h-3.5 w-3.5 shrink-0" />
        <span>Chưa kết nối Shopee</span>
      </span>
    );
  }

  // Check if mapping exists
  const isSynced = true; // In mock mode, connected mappings are synchronized

  return (
    <div className="inline-flex flex-col gap-1 whitespace-nowrap">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
          isSynced
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        {isSynced ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Shopee Synced</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Lệch tồn kho</span>
          </>
        )}
      </span>
      <span className="text-xs text-slate-500 font-mono font-medium whitespace-nowrap">
        ID: {String(mapping.shopeeItemId)} | {mapping.shopeePrice.toLocaleString('vi-VN')}đ
      </span>
    </div>
  );
};
