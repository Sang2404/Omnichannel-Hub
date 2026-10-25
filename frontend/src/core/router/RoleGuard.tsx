import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import type { Role } from '../../features/auth/authSlice';

interface RoleGuardProps {
  allowedRoles: Role[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user || !allowedRoles.includes(user.role)) {
    const fallback = user?.role === 'SUPER_ADMIN' ? '/platform' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};
