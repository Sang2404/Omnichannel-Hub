import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../authSlice';
import { authApi } from '../services/authApi';
import { Shield, Lock, Mail, ArrowRight, Store, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        dispatch(setCredentials(res.data));
        const destination = res.data.user.role === 'SUPER_ADMIN' ? '/platform' : '/dashboard';
        navigate(destination);
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF') => {
    if (role === 'SUPER_ADMIN') {
      setEmail('admin@omnichannel.vn');
      setPassword('admin123');
    } else if (role === 'ADMIN') {
      setEmail('skillsanh@gmail.com');
      setPassword('admin123');
    } else {
      setEmail('sinfour503@gmail.com');
      setPassword('staff123');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      {/* Background Subtle Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-8 relative z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Omnichannel Hub</h1>
            <p className="text-xs text-slate-500">Hệ thống quản lý bán hàng đa kênh & BI Analytics</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email tài khoản
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs border border-blue-700 mt-2"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Đăng Nhập Vận Hành</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center mb-3">Đăng nhập nhanh tài khoản mẫu</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('SUPER_ADMIN')}
              className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-[11px]">Quản trị viên</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN')}
              className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Store className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-[11px]">Chủ Shop</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('STAFF')}
              className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Store className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-[11px]">Nhân Viên</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
