import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading, mfaRequired } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (mfaRequired) {
    return <Navigate to="/auth/mfa-verify" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === 'construtora') {
      return <Navigate to="/dashboard/construtora" replace />;
    } else if (role === 'imobiliaria') {
      return <Navigate to="/dashboard/imobiliaria" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
