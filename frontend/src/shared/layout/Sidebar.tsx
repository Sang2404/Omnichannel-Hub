import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  ShoppingBag,
  Package,
  Users,
  Store,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import type { Role } from '../../features/auth/authSlice';

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Menu riêng biệt cho Quản trị viên hệ thống (Nền tảng SaaS)
  const superAdminNavItems = [
    {
      label: 'Quản trị nền tảng',
      path: '/platform',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN'],
    },
  ];

  // Menu nghiệp vụ vận hành cho Cửa hàng (Chủ shop & Nhân viên)
  const shopNavItems = [
    {
      label: 'Tổng quan',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'STAFF'],
    },
    {
      label: 'Báo cáo & Thống kê',
      path: '/analytics',
      icon: BarChart3,
      roles: ['ADMIN'], // Chỉ Chủ shop (ADMIN) mới được xem số liệu tài chính
    },
    {
      label: 'Tin nhắn Messenger',
      path: '/chat',
      icon: MessageSquare,
      roles: ['ADMIN', 'STAFF'],
    },
    {
      label: 'Đơn hàng',
      path: '/orders',
      icon: ShoppingBag,
      roles: ['ADMIN', 'STAFF'],
    },
    {
      label: 'Sản phẩm & Kho',
      path: '/products',
      icon: Package,
      roles: ['ADMIN', 'STAFF'],
    },
    {
      label: 'Khách hàng',
      path: '/customers',
      icon: Users,
      roles: ['ADMIN', 'STAFF'],
    },
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : shopNavItems;

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none shadow-xs">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
              isSuperAdmin
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}
          >
            {isSuperAdmin ? <ShieldCheck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base tracking-tight leading-snug">
              {isSuperAdmin ? 'Omnichannel SaaS' : 'Omnichannel Hub'}
            </h2>
            <span className="text-xs text-slate-500 font-medium truncate block max-w-[170px]">
              {isSuperAdmin ? 'Quản Trị Nền Tảng' : user?.shopName || 'Bình Dương Commerce'}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Menu quản lý
          </div>

          {navItems.map((item) => {
            if (!item.roles.includes(user?.role || 'STAFF')) return null;

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Role Footer */}
      <div className="p-3 border-t border-slate-200">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-300 shadow-xs">
              <UserIcon className="h-4 w-4 text-slate-600" />
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          {(() => {
            const roleBadges: Record<string, { label: string; class: string }> = {
              SUPER_ADMIN: { label: 'Quản trị viên', class: 'bg-purple-50 text-purple-700 border-purple-200' },
              ADMIN: { label: 'Chủ shop', class: 'bg-blue-50 text-blue-700 border-blue-200' },
              STAFF: { label: 'Nhân viên', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            };
            const badge = roleBadges[user?.role || 'STAFF'] || { label: user?.role, class: 'bg-slate-100 text-slate-700 border-slate-200' };
            return (
              <span className={`px-2 py-0.5 text-xs font-bold rounded tracking-wider shrink-0 border ${badge.class}`}>
                {badge.label}
              </span>
            );
          })()}
        </div>
      </div>
    </aside>
  );
};
