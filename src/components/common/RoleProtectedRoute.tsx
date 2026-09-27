import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Verifying EcoFeast Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to the user's authorized role dashboard
    const roleRoutes: Record<UserRole, string> = {
      kitchen: '/kitchen/dashboard',
      fpu: '/fpu/dashboard',
      ngo: '/ngo/dashboard',
      admin: '/admin/dashboard'
    };
    return <Navigate to={roleRoutes[role] || '/'} replace />;
  }

  return <>{children}</>;
};
