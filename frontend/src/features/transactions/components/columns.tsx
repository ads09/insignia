import { cn } from '@/shared/lib/cn';
import {
  formatAmount,
  formatDate,
  formatSignedAmount,
  formatTime,
} from '@/shared/lib/format';
import type { LedgerTransaction, UserTransaction } from '../types';
import type { Column } from './TransactionTable';
import { Party } from './Party';
import { TypeBadge } from './TypeBadge';

const dateColumn = {
  key: 'created_at',
  header: 'Waktu',
  sortField: 'created_at',
  render: (row: { created_at: string }) => (
    <time dateTime={row.created_at} className="whitespace-nowrap">
      <span className="text-ink font-medium">{formatDate(row.created_at)}</span>
      {/* The time goes to its own line on narrow screens. */}
      <span className="text-ink-muted block sm:ml-1.5 sm:inline">
        {formatTime(row.created_at)}
      </span>
    </time>
  ),
} as const;

export const userTransactionColumns: Column<UserTransaction>[] = [
  dateColumn,
  {
    key: 'type',
    header: 'Tipe',
    mobileHeader: '',
    render: (row) => <TypeBadge type={row.type} />,
  },
  {
    key: 'username',
    header: 'Lawan transaksi',
    render: (row) => <Party username={row.username} />,
  },
  {
    key: 'amount',
    header: 'Nominal',
    sortField: 'amount',
    align: 'right',
    render: (row) => (
      <span
        className={cn(
          'tabular font-bold whitespace-nowrap',
          row.amount < 0 ? 'text-debit-text' : 'text-credit-text',
        )}
      >
        {formatSignedAmount(row.amount)}
      </span>
    ),
  },
];

export const ledgerTransactionColumns: Column<LedgerTransaction>[] = [
  dateColumn,
  {
    key: 'type',
    header: 'Tipe',
    mobileHeader: '',
    render: (row) => <TypeBadge type={row.type} />,
  },
  {
    key: 'from',
    header: 'Dari',
    // Narrow screens have no room for a separate "Ke" column.
    mobileHeader: 'Dari / Ke',
    render: (row) => (
      <>
        <Party username={row.from_username} />
        <span className="text-ink-muted block sm:hidden">
          → {row.to_username}
        </span>
      </>
    ),
  },
  {
    key: 'to',
    header: 'Ke',
    className: 'hidden sm:table-cell',
    render: (row) => <Party username={row.to_username} />,
  },
  {
    key: 'amount',
    header: 'Nominal',
    sortField: 'amount',
    align: 'right',
    render: (row) => (
      <span className="tabular text-ink font-bold whitespace-nowrap">
        {formatAmount(row.amount)}
      </span>
    ),
  },
];
