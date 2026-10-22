import { PageHeader } from '@/shared/components/PageHeader';
import { ledgerTransactionColumns } from '../components/columns';
import { TransactionList } from '../components/TransactionList';
import { TYPE_LABELS } from '../lib/labels';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useAllTransactions } from '../hooks/useTransactions';
import type { LedgerTransactionType } from '../types';

const TYPES = [
  'transfer',
  'topup',
] as const satisfies readonly LedgerTransactionType[];
const TYPE_OPTIONS = TYPES.map((value) => ({
  value,
  label: TYPE_LABELS[value],
}));

export function AdminTransactionsPage() {
  const { filters, setFilters, resetFilters } = useTransactionFilters(TYPES);
  const query = useAllTransactions(filters);

  return (
    <>
      <PageHeader
        title="Semua transaksi"
        description="Transaksi seluruh pengguna. Hanya untuk administrator."
      />
      <TransactionList
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        query={query}
        columns={ledgerTransactionColumns}
        typeOptions={TYPE_OPTIONS}
        searchLabel="Cari pengirim atau penerima"
        showUsername
      />
    </>
  );
}
