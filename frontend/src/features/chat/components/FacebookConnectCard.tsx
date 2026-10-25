import React, { useState, useEffect } from 'react';
import { facebookPageApi, type FacebookPageItem, type FacebookStatusResponse } from '../services/facebookPageApi';
import { CheckCircle2, RefreshCw, Unlink, Globe, AlertCircle, X, ShieldCheck } from 'lucide-react';

export const FacebookConnectCard: React.FC = () => {
  const [status, setStatus] = useState<FacebookStatusResponse['page'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [pages, setPages] = useState<FacebookPageItem[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPageItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await facebookPageApi.getStatus();
      if (res?.data?.isConnected) {
        setStatus(res.data.page);
      } else {
        setStatus(null);
      }
    } catch (err: any) {
      console.error('Error fetching Facebook status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFetchPages = async () => {
    if (!userToken.trim()) {
      setErrorMsg('Vui lòng nhập Access Token hoặc bấm "Dùng Token Mẫu"');
      return;
    }
    setErrorMsg('');
    try {
      setActionLoading(true);
      const res = await facebookPageApi.getPages(userToken.trim());
      if (res?.data && Array.isArray(res.data)) {
        setPages(res.data);
        if (res.data.length > 0) {
          setSelectedPage(res.data[0]);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể lấy danh sách Fanpage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmConnect = async () => {
    if (!selectedPage) return;
    try {
      setActionLoading(true);
      await facebookPageApi.connectPage({
        id: selectedPage.id,
        name: selectedPage.name,
        accessToken: selectedPage.access_token,
      });
      setIsModalOpen(false);
      setUserToken('');
      setPages([]);
      setSelectedPage(null);
      await fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi liên kết Fanpage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn ngắt kết nối với Fanpage này?')) return;
    try {
      setLoading(true);
      await facebookPageApi.disconnectPage();
      setStatus(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi ngắt kết nối');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48"></div>
        <div className="h-8 bg-slate-200 rounded w-28"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent border border-blue-200/80 rounded-xl p-3.5 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            f
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">Kênh Bán Facebook Messenger</span>
              {status ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Meta Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Chưa liên kết
                </span>
              )}
            </div>

            {status ? (
              <p className="text-xs text-slate-600 mt-0.5">
                Đang kết nối: <strong className="text-blue-700 font-semibold">{status.name}</strong> (ID: {status.id})
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">
                Chưa kết nối Fanpage chính thức. Kết nối để tự động nhận tin nhắn khách hàng & chốt đơn.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status ? (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 border border-blue-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Đổi Fanpage
              </button>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                Hủy kết nối
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1877F2] hover:bg-blue-600 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              Kết nối Fanpage Facebook ngay
            </button>
          )}
        </div>
      </div>

      {/* MODAL KẾT NỐI FANPAGE FACEBOOK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm">
                  f
                </div>
                <h3 className="font-semibold text-slate-800 text-base">Kết Nối Fanpage Facebook Chính Thức</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  User Access Token (Meta Graph API)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={userToken}
                    onChange={(e) => setUserToken(e.target.value)}
                    placeholder="Dán mã User Access Token từ Meta for Developers..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setUserToken('demo_token')}
                    className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg whitespace-nowrap transition-colors"
                  >
                    Dùng Token Mẫu
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mẹo: Nhấn <strong>Dùng Token Mẫu</strong> để thử nghiệm kết nối với Fanpage mẫu.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleFetchPages}
                disabled={actionLoading}
                className="w-full py-2.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Tải Danh Sách Fanpage Bạn Sở Hữu
              </button>

              {/* Danh sách Pages tìm thấy */}
              {pages.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Chọn Fanpage Muốn Kết Nối ({pages.length} trang tìm thấy):
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pages.map((p) => {
                      const isSelected = selectedPage?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPage(p)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-sm text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Page ID: <span className="font-mono text-slate-600">{p.id}</span>
                              {p.category && ` • ${p.category}`}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmConnect}
                disabled={!selectedPage || actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1877F2] hover:bg-blue-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Xác Nhận Kết Nối Fanpage
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
