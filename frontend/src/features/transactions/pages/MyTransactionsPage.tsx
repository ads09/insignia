import { PageHeader } from '@/shared/components/PageHeader';
import { userTransactionColumns } from '../components/columns';
import { TransactionList } from '../components/TransactionList';
import { TYPE_LABELS } from '../lib/labels';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useMyTransactions } from '../hooks/useTransactions';
import type { UserTransactionType } from '../types';

const TYPES = [
  'credit',
  'debit',
  'topup',
] as const satisfies readonly UserTransactionType[];
const TYPE_OPTIONS = TYPES.map((value) => ({
  value,
  label: TYPE_LABELS[value],
}));

export function MyTransactionsPage() {
  const { filters, setFilters, resetFilters } = useTransactionFilters(TYPES);
  const query = useMyTransactions(filters);

  return (
    <>
      <PageHeader
        title="Transaksi saya"
        description="Topup dan transfer masuk atau keluar dari dompet Anda."
      />
      <TransactionList
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        query={query}
        columns={userTransactionColumns}
        typeOptions={TYPE_OPTIONS}
        searchLabel="Cari lawan transaksi"
      />
    </>
  );
}
