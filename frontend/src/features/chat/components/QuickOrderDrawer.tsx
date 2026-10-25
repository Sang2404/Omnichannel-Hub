import React, { useState, useEffect } from 'react';
import { productApi, type Product } from '../../product/services/productApi';
import { orderApi } from '../../order/services/orderApi';
import { chatApi } from '../services/chatApi';
import { axiosClient } from '../../../core/api/axiosClient';
import { X, Sparkles, Check, Plus, Minus, Phone, MapPin, Loader2, ShoppingBag, UserCheck } from 'lucide-react';

interface QuickOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  conversationId: string;
  initialPhone?: string;
  initialAddress?: string;
  originalPhone?: string;
  originalAddress?: string;
  onOrderCreated?: () => void;
  onCustomerUpdated?: (updated: { phone?: string; address?: string }) => void;
}

export const QuickOrderDrawer: React.FC<QuickOrderDrawerProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  conversationId,
  initialPhone = '',
  initialAddress = '',
  originalPhone = '',
  originalAddress = '',
  onOrderCreated,
  onCustomerUpdated,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [phone, setPhone] = useState<string>(initialPhone);
  const [address, setAddress] = useState<string>(initialAddress);
  const [shippingFee] = useState<number>(30000); // Standard GHN Fee
  const [loading, setLoading] = useState<boolean>(false);
  const [aiDetected, setAiDetected] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [shouldUpdateProfile, setShouldUpdateProfile] = useState<boolean>(true);

  // Check if phone or address differs from customer's existing profile
  const isPhoneChanged = phone.trim() !== (originalPhone || '').trim() && phone.trim().length >= 10;
  const isAddressChanged = address.trim() !== (originalAddress || '').trim() && address.trim().length >= 5;
  const hasProfileChanges = isPhoneChanged || isAddressChanged;

  // 1-Click Auto Fill on Open: loads products and parses chat messages automatically
  useEffect(() => {
    if (isOpen) {
      setPhone(initialPhone || originalPhone || '');
      setAddress(initialAddress || originalAddress || '');
      setShouldUpdateProfile(true);
      setAiDetected(false);

      // Fetch products and auto-parse order from chat in parallel
      Promise.all([
        productApi.getProducts(),
        chatApi.aiParseOrder({ conversationId }).catch(() => null),
      ]).then(([prodRes, parseRes]) => {
        let loadedProducts: Product[] = [];
        if (prodRes && prodRes.success && prodRes.data) {
          loadedProducts = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data as any).products || [];
          setProducts(loadedProducts);
        }

        if (parseRes && parseRes.success && parseRes.data) {
          const parsed = parseRes.data;
          let detectedSomething = false;

          // 1. Auto-select matched product from chat
          if (parsed.suggestedProduct?.id) {
            const matched = loadedProducts.find((p) => p.id === parsed.suggestedProduct.id);
            if (matched) {
              setSelectedProductId(matched.id);
              detectedSomething = true;
            }
          } else if (loadedProducts.length > 0) {
            setSelectedProductId(loadedProducts[0].id);
          }

          // 2. Auto-fill quantity from chat
          if (parsed.quantity && parsed.quantity > 0) {
            setQuantity(parsed.quantity);
            detectedSomething = true;
          }

          // 3. Auto-fill phone from chat if valid
          if (parsed.phone) {
            setPhone(parsed.phone);
            detectedSomething = true;
          }

          // 4. Auto-fill address from chat
          if (parsed.fullAddress) {
            setAddress(parsed.fullAddress);
            detectedSomething = true;
          }

          if (detectedSomething) {
            setAiDetected(true);
          }
        } else if (loadedProducts.length > 0) {
          setSelectedProductId(loadedProducts[0].id);
        }
      });
    }
  }, [isOpen, conversationId, initialPhone, initialAddress, originalPhone, originalAddress]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const productPrice = selectedProduct ? selectedProduct.price : 0;
  const subtotal = productPrice * quantity;
  const totalAmount = subtotal + shippingFee;

  const handleCreateOrderAndSendQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setLoading(true);
    setSuccessMsg(null);

    try {
      // 1. Create Order via Order API
      const orderRes = await orderApi.createOrder({
        customerId,
        channel: 'FACEBOOK',
        items: [
          {
            productId: selectedProductId,
            quantity,
          },
        ],
      });

      if (orderRes.success && orderRes.data) {
        const orderData = (orderRes.data as any).order || orderRes.data;
        const code = orderData.orderCode;
        const checkoutUrl = (orderRes.data as any).payment?.checkoutUrl || `https://payos.vn/checkout/${code}`;

        // 2. Synchronize customer profile if phone or address changed and confirmed
        if (hasProfileChanges && shouldUpdateProfile) {
          try {
            await axiosClient.put(`/customers/${customerId}`, {
              phone: isPhoneChanged ? phone.trim() : undefined,
              address: isAddressChanged ? address.trim() : undefined,
            });

            if (onCustomerUpdated) {
              onCustomerUpdated({
                phone: isPhoneChanged ? phone.trim() : undefined,
                address: isAddressChanged ? address.trim() : undefined,
              });
            }
          } catch (profileErr) {
            console.warn('Customer profile update skipped or failed:', profileErr);
          }
        }

        // 3. Append VietQR Payment message directly into Chat Thread
        const qrMessage = `Đơn hàng #${code} của bạn đã được khởi tạo thành công!
Sản phẩm: ${selectedProduct?.name} (x${quantity})
${phone ? `SĐT nhận hàng: ${phone}\n` : ''}${address ? `Địa chỉ nhận hàng: ${address}\n` : ''}Tổng thanh toán: ${totalAmount.toLocaleString('vi-VN')}đ (gồm 30.000đ phí giao hàng)
Quét mã VietQR thanh toán: ${checkoutUrl}
Nội dung chuyển khoản: TDMU${code} thanh toan`;

        await chatApi.sendMessage({
          conversationId,
          content: qrMessage,
          messageType: 'QR_CODE',
        });

        setSuccessMsg(`Đã tạo đơn #${code} và gửi mã VietQR cho khách`);
        if (onOrderCreated) onOrderCreated();

        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Tạo đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tạo đơn hàng nhanh</h3>
                <p className="text-xs text-slate-500">Khách hàng: {customerName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>



          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCreateOrderAndSendQR} className="space-y-4 text-sm">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Sản phẩm đặt mua
                </label>
                {aiDetected && selectedProduct && (
                  <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Khớp từ tin nhắn
                  </span>
                )}
              </div>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name} — {p.price.toLocaleString('vi-VN')}đ (Kho: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số lượng
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-slate-900 text-sm w-7 text-center font-mono tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Số điện thoại
                  </label>
                  {phone && phone !== originalPhone && (
                    <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Từ chat
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Địa chỉ nhận hàng (GHN)
                </label>
                {address && address !== originalAddress && (
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    Từ chat
                  </span>
                )}
              </div>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Smart Confirmation Box: ONLY shown if phone or address was modified */}
            {hasProfileChanges && (
              <label className="flex items-start gap-2.5 p-3 bg-blue-50/70 border border-blue-200/90 rounded-xl text-xs cursor-pointer hover:bg-blue-50 transition-colors animate-in fade-in duration-200">
                <input
                  type="checkbox"
                  checked={shouldUpdateProfile}
                  onChange={(e) => setShouldUpdateProfile(e.target.checked)}
                  className="mt-0.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>Cập nhật thông tin mới vào hồ sơ khách hàng</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {isPhoneChanged && (
                      <span>SĐT: <strong className="text-slate-800 font-mono">{originalPhone || 'Trống'}</strong> ➔ <strong className="text-blue-700 font-mono">{phone}</strong></span>
                    )}
                    {isPhoneChanged && isAddressChanged && <span> · </span>}
                    {isAddressChanged && <span>Cập nhật địa chỉ nhận hàng mới</span>}
                  </p>
                </div>
              </label>
            )}

            {/* Calculations Breakdown */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tiền hàng:</span>
                <span className="font-semibold text-slate-800 font-mono tabular-nums">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Phí giao hàng GHN:</span>
                <span className="font-semibold text-slate-800 font-mono tabular-nums">{shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>Tổng cộng:</span>
                <span className="text-blue-600 font-mono tabular-nums">{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Unified Action Footer */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-28 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors text-center"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Tạo đơn & Gửi VietQR</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
