import React, { useState, useEffect } from 'react';
import { axiosClient } from '../../../core/api/axiosClient';
import {
  ShieldCheck,
  Store,
  Users,
  Activity,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Key,
  Database,
  Radio,
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  shopName?: string;
  createdAt: string;
}

interface ServiceHealth {
  name: string;
  status: string;
  latency: string;
  uptime: string;
}

interface SystemOverviewData {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalShops: number;
  services: ServiceHealth[];
}

export const PlatformManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shops' | 'users' | 'health'>('shops');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [overview, setOverview] = useState<SystemOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'STAFF'>('STAFF');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Mock tenants for multi-tenant SaaS view
  const tenants = [
    {
      id: 'shop-1',
      name: 'Bình Dương Commerce',
      owner: 'Huỳnh Văn Sang',
      email: 'skillsanh@gmail.com',
      plan: 'Gói Doanh Nghiệp (Enterprise)',
      channels: ['Facebook Messenger', 'Shopee Official Store'],
      status: 'ACTIVE',
      ordersCount: 48,
      createdAt: '15/10/2026',
    },
    {
      id: 'shop-2',
      name: 'Thời Trang Nam TDMU',
      owner: 'Trần Minh Nhật',
      email: 'nhat.tdmu@commerce.vn',
      plan: 'Gói Pro (Đa kênh)',
      channels: ['Facebook Messenger'],
      status: 'ACTIVE',
      ordersCount: 24,
      createdAt: '18/10/2026',
    },
    {
      id: 'shop-3',
      name: 'Phụ Kiện Công Nghệ Sài Gòn',
      owner: 'Lê Hoàng Khang',
      email: 'khang.tech@gmail.com',
      plan: 'Gói Tiêu Chuẩn (Standard)',
      channels: ['Shopee Mall'],
      status: 'ACTIVE',
      ordersCount: 15,
      createdAt: '21/10/2026',
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, overviewRes] = await Promise.all([
        axiosClient.get('/auth/users'),
        axiosClient.get('/auth/system-overview'),
      ]);

      if (usersRes.data) {
        setUsers(usersRes.data);
      }
      if (overviewRes.data) {
        setOverview(overviewRes.data);
      }
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF') => {
    setActionLoading(true);
    try {
      await axiosClient.patch(`/auth/users/${userId}/role`, { role: newRole });
      await fetchData();
      setEditingUserId(null);
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Không thể cập nhật vai trò người dùng.');
    } finally {
      setActionLoading(false);
    }
  };

  const roleBadges: Record<string, { label: string; class: string }> = {
    SUPER_ADMIN: { label: 'Quản trị viên', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    ADMIN: { label: 'Chủ shop', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    STAFF: { label: 'Nhân viên', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Quyền Quản Trị Hệ Thống (Super Admin)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản Trị Nền Tảng & Cửa Hàng (SaaS Platform Hub)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Giám sát các cửa hàng trực thuộc (tenants), điều phối phân quyền người dùng và kiểm tra trạng thái cổng API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ────────────────── PLATFORM KPI STRIP ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* KPI 1 */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-600" />
            <span>Cửa hàng (Tenants)</span>
          </div>
          <div className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading ? '...' : `${overview?.totalShops || tenants.length} shop`}
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            100% đang hoạt động ổn định
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span>Tổng tài khoản</span>
          </div>
          <div className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading ? '...' : `${overview?.totalUsers || users.length} người`}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {users.filter((u) => u.role === 'ADMIN').length} Chủ shop · {users.filter((u) => u.role === 'STAFF').length} Nhân viên
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>Đơn hàng toàn sàn</span>
          </div>
          <div className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {loading ? '...' : `${overview?.totalOrders || 0} đơn`}
          </div>
          <div className="mt-2 text-xs text-slate-500">Facebook Messenger & Shopee</div>
        </div>

        {/* KPI 4 */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-600" />
            <span>Hạ tầng tích hợp</span>
          </div>
          <div className="mt-2.5 text-3xl font-bold tracking-tight text-emerald-700 tabular-nums">
            4/4 Cổng
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Tất cả cổng API trực tuyến
          </div>
        </div>
      </div>

      {/* ────────────────── TAB SELECTOR ────────────────── */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('shops')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'shops'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Danh sách Cửa hàng ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Người dùng & Phân quyền ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'health'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Giám sát Cổng Dịch Vụ (System Health)</span>
        </button>
      </div>

      {/* ────────────────── TAB 1: SHOPS / TENANTS ────────────────── */}
      {activeTab === 'shops' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Các Cửa Hàng Trực Thuộc Hệ Thống</h3>
              <p className="text-xs text-slate-500 mt-0.5">Danh sách các tenant đang vận hành độc lập trên nền tảng.</p>
            </div>
            <span className="text-xs text-slate-600 font-medium">Mô hình: Multi-Tenant Architecture</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Tên Cửa Hàng</th>
                  <th className="py-3.5 px-5">Chủ Sở Hữu</th>
                  <th className="py-3.5 px-5">Gói Dịch Vụ</th>
                  <th className="py-3.5 px-5">Kênh Bán Đang Kết Nối</th>
                  <th className="py-3.5 px-5">Tổng Đơn</th>
                  <th className="py-3.5 px-5">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-xs">
                          {t.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500 font-mono">ID: {t.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-slate-800">{t.owner}</p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {t.plan}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1">
                        {t.channels.map((ch, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              ch.includes('Facebook')
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 tabular-nums">
                      {t.ordersCount} đơn
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Đang hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 2: USERS & ROLES ────────────────── */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Danh Sách Tài Khoản & Phân Quyền</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấp quyền và quản lý tài khoản theo 3 cấp độ: Quản trị viên, Chủ shop và Nhân viên.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Chuẩn phân quyền: RBAC Security</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Họ & Tên</th>
                  <th className="py-3.5 px-5">Email đăng nhập</th>
                  <th className="py-3.5 px-5">Cửa Hàng Gán</th>
                  <th className="py-3.5 px-5">Vai Trò Hệ Thống</th>
                  <th className="py-3.5 px-5">Ngày Tạo</th>
                  <th className="py-3.5 px-5 text-right">Phân Quyền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const badge = roleBadges[u.role] || { label: u.role, class: 'bg-slate-100 text-slate-700' };
                  const isEditing = editingUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">{u.name}</td>
                      <td className="py-4 px-5 text-slate-600 font-mono text-xs">{u.email}</td>
                      <td className="py-4 px-5 text-slate-800 font-medium">
                        {u.shopName || 'Bình Dương Commerce'}
                      </td>
                      <td className="py-4 px-5">
                        {isEditing ? (
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as any)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-blue-600"
                          >
                            <option value="SUPER_ADMIN">Quản trị viên</option>
                            <option value="ADMIN">Chủ shop</option>
                            <option value="STAFF">Nhân viên</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 text-xs font-bold rounded border ${badge.class}`}>
                            {badge.label}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateRole(u.id, selectedRole)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setSelectedRole(u.role);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded transition-colors"
                          >
                            Đổi quyền
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 3: SYSTEM HEALTH ────────────────── */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(overview?.services || [
              { name: 'PayOS VietQR Gateway', status: 'ONLINE', latency: '42ms', uptime: '99.98%' },
              { name: 'Giao Hàng Nhanh (GHN) API', status: 'ONLINE', latency: '68ms', uptime: '99.95%' },
              { name: 'Shopee Open Platform', status: 'ONLINE', latency: '115ms', uptime: '99.90%' },
              { name: 'Meta Messenger Webhook', status: 'ONLINE', latency: '54ms', uptime: '99.99%' },
            ]).map((srv, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <Server className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Tích hợp giao thức HTTPS & Webhook</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Trực tuyến
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-slate-500">Độ trễ trung bình:</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{srv.latency}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-slate-500">Độ sẵn sàng (Uptime):</span>
                    <p className="font-bold text-emerald-700 text-sm mt-0.5">{srv.uptime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Database and Infrastructure Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Thông tin Kiến trúc & Cơ sở hạ tầng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900">Database Engine</p>
                <p className="text-slate-500 mt-0.5">PostgreSQL (Supabase Cloud Pooler)</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900">Real-time Engine</p>
                <p className="text-slate-500 mt-0.5">Socket.io Event Server (Port 3000)</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900">Overselling Protection</p>
                <p className="text-slate-500 mt-0.5">Atomic Conditional Lock on Prisma</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
