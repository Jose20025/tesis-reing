import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../stores/auth.store';

export const AuthGuardian = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
