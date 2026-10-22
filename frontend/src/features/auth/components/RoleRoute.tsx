import { Outlet } from 'react-router';
import { ForbiddenPage } from '@/shared/components/StatusPage';
import { useAuth } from '../context/useAuth';
import type { Role } from '../types';

/** Renders the child routes only for users with `requiredRole`; must sit below ProtectedRoute. */
export function RoleRoute({ requiredRole }: { requiredRole: Role }) {
  const { user } = useAuth();
  return user?.role === requiredRole ? <Outlet /> : <ForbiddenPage />;
}
