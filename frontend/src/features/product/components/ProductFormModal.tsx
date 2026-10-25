import React, { useState, useEffect } from 'react';
import type { Product, CreateProductInput } from '../services/productApi';
import { X, Package, Store, Check } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProductInput) => Promise<void>;
  initialData?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [weight, setWeight] = useState<number>(500);

  // Shopee Mapping toggle & fields
  const [enableShopee, setEnableShopee] = useState(false);
  const [shopeeItemId, setShopeeItemId] = useState<number | undefined>(undefined);
  const [shopeePrice, setShopeePrice] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku);
      setName(initialData.name);
      setDescription(initialData.description || '');
      setPrice(initialData.price);
      setStock(initialData.stock);
      setWeight(initialData.weight);

      if (initialData.shopeeItemMapping) {
        setEnableShopee(true);
        setShopeeItemId(Number(initialData.shopeeItemMapping.shopeeItemId));
        setShopeePrice(initialData.shopeeItemMapping.shopeePrice);
      } else {
        setEnableShopee(false);
      }
    } else {
      setSku('');
      setName('');
      setDescription('');
      setPrice(0);
      setStock(0);
      setWeight(500);
      setEnableShopee(false);
      setShopeeItemId(undefined);
      setShopeePrice(undefined);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        sku,
        name,
        description,
        price,
        stock,
        weight,
        shopeeItemId: enableShopee ? shopeeItemId : undefined,
        shopeePrice: enableShopee ? shopeePrice : undefined,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {initialData ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PROD-JEANS-001"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cân nặng (Grams) *
              </label>
              <input
                type="number"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                placeholder="500"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên Sản Phẩm *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Quần Jeans Slimfit Nam..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giá Bán (VND) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="250000"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số Lượng Tồn Kho *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                placeholder="100"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Shopee Integration Mapping Switch */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Store className="h-4.5 w-4.5 text-orange-600" />
                <span className="font-bold text-slate-800 text-sm">Đồng bộ sản phẩm lên Shopee</span>
              </div>
              <input
                type="checkbox"
                checked={enableShopee}
                onChange={(e) => setEnableShopee(e.target.checked)}
                className="h-4.5 w-4.5 accent-orange-600 cursor-pointer"
              />
            </div>

            {enableShopee && (
              <div className="p-3.5 bg-orange-50/60 border border-orange-200 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Shopee Item ID *</label>
                    <input
                      type="number"
                      required={enableShopee}
                      value={shopeeItemId || ''}
                      onChange={(e) => setShopeeItemId(Number(e.target.value))}
                      placeholder="22134567890"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Giá Bán Shopee (VND) *</label>
                    <input
                      type="number"
                      required={enableShopee}
                      value={shopeePrice || ''}
                      onChange={(e) => setShopeePrice(Number(e.target.value))}
                      placeholder="280000"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Check className="h-4.5 w-4.5" />
                  <span>Lưu Sản Phẩm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
