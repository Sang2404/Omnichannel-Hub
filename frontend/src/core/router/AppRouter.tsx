import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { MainLayout } from '../../shared/layout/MainLayout';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { ProductListPage } from '../../features/product/pages/ProductListPage';
import { OrderListPage } from '../../features/order/pages/OrderListPage';
import { ChatPage } from '../../features/chat/pages/ChatPage';
import { CustomerListPage } from '../../features/customer/pages/CustomerListPage';
import { AnalyticsPage } from '../../features/analytics/pages/AnalyticsPage';
import { PlatformManagementPage } from '../../features/admin/pages/PlatformManagementPage';

import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

const DefaultRedirect: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return <Navigate to={user?.role === 'SUPER_ADMIN' ? '/platform' : '/dashboard'} replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Super Admin-only Platform Route */}
            <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN']} />}>
              <Route path="/platform" element={<PlatformManagementPage />} />
            </Route>

            {/* Shop Owner (ADMIN) Analytics Route */}
            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Shop Operational Routes (Shop Owner & Staff only) */}
            <Route element={<RoleGuard allowedRoles={['ADMIN', 'STAFF']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/customers" element={<CustomerListPage />} />
            </Route>

            {/* Default Catch-all */}
            <Route path="/" element={<DefaultRedirect />} />
            <Route path="*" element={<DefaultRedirect />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
