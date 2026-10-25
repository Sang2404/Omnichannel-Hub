import React, { useState, useEffect } from 'react';
import { productApi, type Product, type CreateProductInput } from '../services/productApi';
import { ShopeeSyncBadge } from '../../../shared/components/status-badges/ShopeeSyncBadge';
import { ProductFormModal } from '../components/ProductFormModal';
import { Package, Plus, Search, Edit2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).products || [];
        setProducts(list);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateOrUpdate = async (input: CreateProductInput) => {
    if (editingProduct) {
      await productApi.updateProduct(editingProduct.id, input);
    } else {
      await productApi.createProduct(input);
    }
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      await productApi.deleteProduct(id);
      await fetchProducts();
    }
  };

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (stockFilter === 'IN_STOCK') return p.stock > 5;
    if (stockFilter === 'LOW_STOCK') return p.stock > 0 && p.stock <= 5;
    if (stockFilter === 'OUT_OF_STOCK') return p.stock === 0;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Quản Lý Sản Phẩm & Đồng Bộ Kho</h1>
          <p className="text-sm text-slate-500 mt-1">Danh mục sản phẩm và trạng thái đồng bộ tồn kho đa kênh.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
          {[
            { id: 'ALL', label: 'Tất cả sản phẩm', count: products.length },
            { id: 'IN_STOCK', label: 'Còn hàng', count: products.filter((p) => p.stock > 5).length },
            { id: 'LOW_STOCK', label: 'Sắp hết hàng (≤5)', count: lowStockCount, alert: lowStockCount > 0 },
            { id: 'OUT_OF_STOCK', label: 'Hết hàng (0)', count: outOfStockCount, alert: outOfStockCount > 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStockFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-2 ${
                stockFilter === tab.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  tab.alert
                    ? 'bg-rose-100 text-rose-700'
                    : stockFilter === tab.id
                    ? 'bg-blue-200/60 text-blue-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> / {products.length} sản phẩm
          </span>
        </div>
      </div>

      {/* High-density Enterprise Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-7 w-7 border-2 border-blue-600 border-t-transparent" />
            <span>Đang tải danh sách sản phẩm...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  <th className="py-3.5 px-5">Mã SKU</th>
                  <th className="py-3.5 px-5">Tên sản phẩm</th>
                  <th className="py-3.5 px-5">Giá niêm yết</th>
                  <th className="py-3.5 px-5">Tồn kho liên kênh</th>
                  <th className="py-3.5 px-5">Trọng lượng</th>
                  <th className="py-3.5 px-5">Trạng thái Shopee</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 text-sm tabular-nums whitespace-nowrap">{p.sku}</td>
                    <td className="py-4 px-5 font-medium text-slate-900 text-sm min-w-[200px]">{p.name}</td>
                    <td className="py-4 px-5 font-bold text-slate-900 text-sm tabular-nums whitespace-nowrap">{p.price.toLocaleString('vi-VN')}đ</td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="font-bold text-slate-900 tabular-nums text-sm">
                            {p.stock}
                          </span>
                          <span className="text-xs text-slate-500 font-normal">thực tế</span>
                          {p.stock === 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shrink-0">
                              Hết hàng
                            </span>
                          ) : p.stock <= 5 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                              <AlertTriangle className="h-3 w-3 shrink-0" /> Sắp hết
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                              Ổn định
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 whitespace-nowrap">
                          <span>Khả dụng: <strong className="text-slate-800 font-mono tabular-nums">{p.stock}</strong></span>
                          <span>·</span>
                          <span className="text-slate-400">Ngưỡng: 5</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-sm whitespace-nowrap">{p.weight}g</td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <ShopeeSyncBadge mapping={p.shopeeItemMapping} stock={p.stock} />
                    </td>
                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-slate-500">
            <Package className="h-9 w-9 text-slate-300 mx-auto mb-2" />
            <span>Không tìm thấy sản phẩm nào trong bộ lọc này.</span>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingProduct}
      />
    </div>
  );
};
