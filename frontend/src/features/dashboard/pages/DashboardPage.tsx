import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { RecentTransactions } from '@/features/transactions';
import { BalanceCard, WalletActions } from '@/features/wallet';
import { PageHeader } from '@/shared/components/PageHeader';
import { ActivitySummary } from '../components/ActivitySummary';
import { BalanceHistory } from '../components/BalanceHistory';
import { TopTransactionsChart } from '../components/TopTransactionsChart';
import { TopUsersChart } from '../components/TopUsersChart';

function greeting(hour: number): string {
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export function DashboardPage() {
  const { user } = useAuth();
  const [hello] = useState(() => greeting(new Date().getHours()));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          user
            ? `${hello}, ${user.username}. Ini ringkasan dompet Anda.`
            : undefined
        }
      />
      <div className="grid gap-6 xl:grid-cols-12">
        {user && (
          <BalanceCard
            username={user.username}
            className="xl:col-span-8"
            actions={<WalletActions tone="hero" />}
          >
            <BalanceHistory />
          </BalanceCard>
        )}
        <ActivitySummary className="xl:col-span-4" />
        <div className="flex min-w-0 xl:col-span-6 [&>*]:flex-1">
          <TopTransactionsChart />
        </div>
        <div className="flex min-w-0 xl:col-span-6 [&>*]:flex-1">
          <TopUsersChart />
        </div>
        <RecentTransactions className="xl:col-span-12" />
      </div>
    </>
  );
}
