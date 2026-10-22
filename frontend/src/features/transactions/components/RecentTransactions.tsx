import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { toApiError } from '@/shared/api/api-error';
import { Panel } from '@/shared/components/Panel';
import { useMyTransactions } from '../hooks/useTransactions';
import { DEFAULT_FILTERS } from '../lib/filters';
import { userTransactionColumns } from './columns';
import { TransactionTable } from './TransactionTable';

const RECENT = { ...DEFAULT_FILTERS, limit: 8 };

/** The latest transactions of the signed-in user. */
export function RecentTransactions({ className }: { className?: string }) {
  const query = useMyTransactions(RECENT);

  return (
    <Panel
      title="Transaksi terbaru"
      description="Topup dan transfer terakhir di dompet Anda."
      className={className}
      flush
      actions={
        <Link
          to="/transactions"
          className="text-brand inline-flex items-center gap-1 text-[13px] font-semibold hover:underline"
        >
          Lihat semua
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
    >
      <TransactionTable
        columns={userTransactionColumns}
        rows={query.data?.data}
        isPending={query.isPending}
        isFetching={false}
        errorMessage={
          query.isError ? toApiError(query.error).message : undefined
        }
        onRetry={() => void query.refetch()}
        emptyMessage="Belum ada transaksi. Mulai dengan topup saldo."
      />
    </Panel>
  );
}
