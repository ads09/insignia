import { lazy } from 'react';

// The pages behind the login are loaded on demand, which keeps Chart.js out of
// the bundle needed for the login page.
export const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((module) => ({
    default: module.DashboardPage,
  })),
);
export const WalletPage = lazy(() =>
  import('@/features/wallet').then((module) => ({
    default: module.WalletPage,
  })),
);
export const MyTransactionsPage = lazy(() =>
  import('@/features/transactions').then((module) => ({
    default: module.MyTransactionsPage,
  })),
);
export const AdminTransactionsPage = lazy(() =>
  import('@/features/transactions').then((module) => ({
    default: module.AdminTransactionsPage,
  })),
);
