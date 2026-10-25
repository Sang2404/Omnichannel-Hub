import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Users, Package, MessageSquare, X, Command } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const sampleItems = [
    { type: 'order', title: 'Đơn hàng #1 - Nguyễn Văn A (400.000đ)', path: '/orders', icon: ShoppingBag },
    { type: 'order', title: 'Đơn hàng #2 - Trần Thị B (170.000đ)', path: '/orders', icon: ShoppingBag },
    { type: 'product', title: 'SKU: PROD-JEANS-001 - Quần Jeans Slimfit', path: '/products', icon: Package },
    { type: 'product', title: 'SKU: PROD-TSHIRT-002 - Áo T-Shirt Cotton', path: '/products', icon: Package },
    { type: 'customer', title: 'Khách hàng: Nguyễn Văn A (0987654321)', path: '/customers', icon: Users },
    { type: 'chat', title: 'Hội thoại Chat Facebook: Nguyễn Văn A', path: '/chat', icon: MessageSquare },
  ];

  const filteredItems = sampleItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ mã đơn hàng (#1), tên khách hàng, mã SKU sản phẩm..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] text-slate-500 font-mono">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(item.path)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-3 transition-colors text-xs text-slate-700 group"
                >
                  <div className="h-7 w-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="flex-1 font-medium">{item.title}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    {item.type}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Không tìm thấy kết quả phù hợp với "{query}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="h-3 w-3 text-slate-400" />
            <span>Thanh tìm kiếm nhanh Command Palette</span>
          </div>
          <span>Nhấn Enter để chọn</span>
        </div>
      </div>
    </div>
  );
};
