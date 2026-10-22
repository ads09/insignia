import { Navigate, Outlet, useLocation } from 'react-router';
import { PageSpinner } from '@/shared/components/Spinner';
import { ErrorState } from '@/shared/components/States';
import { useAuth } from '../context/useAuth';

/** Renders the child routes only for a signed-in user. */
export function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();

  switch (status) {
    case 'anonymous':
      return <Navigate to="/login" replace state={{ from: location }} />;
    case 'loading':
      return <PageSpinner />;
    case 'error':
      return (
        <ErrorState
          message="Data akun gagal dimuat. Periksa koneksi Anda."
          onRetry={retry}
        />
      );
    case 'authenticated':
      return <Outlet />;
  }
}
