import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/useAuth';

interface LocationState {
  from?: { pathname: string; search: string };
}

/** Login and registration pages: a signed-in user is sent back to the app. */
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'anonymous') {
    return <Outlet />;
  }
  const from = (location.state as LocationState | null)?.from;
  return (
    <Navigate to={from ? `${from.pathname}${from.search}` : '/'} replace />
  );
}
