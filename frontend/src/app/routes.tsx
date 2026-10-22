import type { RouteObject } from 'react-router';
import {
  GuestRoute,
  LoginPage,
  ProtectedRoute,
  RegisterPage,
  RoleRoute,
} from '@/features/auth';
import { NotFoundPage } from '@/shared/components/StatusPage';
import { AppLayout } from './layout/AppLayout';
import {
  AdminTransactionsPage,
  DashboardPage,
  MyTransactionsPage,
  WalletPage,
} from './lazy-pages';

export const routes: RouteObject[] = [
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'transactions', element: <MyTransactionsPage /> },
          {
            element: <RoleRoute requiredRole="ADMIN" />,
            children: [
              {
                path: 'admin/transactions',
                element: <AdminTransactionsPage />,
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
