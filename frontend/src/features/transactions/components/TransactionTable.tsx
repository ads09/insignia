import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState, ErrorState } from '@/shared/components/States';
import { cn } from '@/shared/lib/cn';
import type { SortField, SortOrder } from '../types';

export interface Column<T> {
  key: string;
  header: string;
  /** Makes the column header a sort toggle for this API field. */
  sortField?: SortField;
  align?: 'left' | 'right';
  /**
   * Header shown on narrow screens instead of `header`. An empty string hides
   * the header text there, while screen readers still read `header`.
   */
  mobileHeader?: string;
  /** Extra classes for the column's cells, e.g. to hide it on narrow screens. */
  className?: string;
  render: (row: T) => ReactNode;
}

interface TransactionTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[] | undefined;
  isPending: boolean;
  /** A new page or filter is loading while the previous rows are shown. */
  isFetching: boolean;
  errorMessage?: string;
  onRetry: () => void;
  /** The current sorting. Without `onSortChange` the columns cannot be sorted. */
  sort?: SortField;
  order?: SortOrder;
  onSortChange?: (sort: SortField, order: SortOrder) => void;
  emptyMessage?: string;
  emptyAction?: ReactNode;
}

const SKELETON_ROWS = 5;

/** Cell padding: tighter on narrow screens, aligned with the panel's edges. */
const CELL = 'px-2 first:pl-4 last:pr-4 sm:px-3 sm:first:pl-5 sm:last:pr-5';

export function TransactionTable<T extends { id: string }>({
  columns,
  rows,
  isPending,
  isFetching,
  errorMessage,
  onRetry,
  sort,
  order,
  onSortChange,
  emptyMessage = 'Tidak ada transaksi yang cocok dengan filter ini.',
  emptyAction,
}: TransactionTableProps<T>) {
  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }
  if (!isPending && rows?.length === 0) {
    return <EmptyState message={emptyMessage} action={emptyAction} />;
  }

  return (
    <div className="overflow-x-auto">
      <table
        aria-busy={isFetching || undefined}
        className={cn(
          'w-full text-sm transition-opacity',
          isFetching && 'opacity-60',
        )}
      >
        <thead>
          <tr className="border-line bg-surface-muted text-ink-muted border-y text-[13px]">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={
                  onSortChange && column.sortField && column.sortField === sort
                    ? order === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                className={cn(
                  CELL,
                  'py-2.5 font-semibold',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.className,
                )}
              >
                {column.sortField && onSortChange ? (
                  <SortButton
                    label={column.header}
                    active={column.sortField === sort}
                    order={order ?? 'desc'}
                    onClick={() => {
                      const field = column.sortField as SortField;
                      onSortChange(
                        field,
                        field === sort && order === 'desc' ? 'asc' : 'desc',
                      );
                    }}
                  />
                ) : (
                  <HeaderLabel column={column} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isPending || !rows
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <tr
                  key={index}
                  aria-hidden="true"
                  className="border-line border-b last:border-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      aria-hidden="true"
                      className={cn(CELL, 'py-3', column.className)}
                    >
                      <span className="bg-surface-muted block h-4 animate-pulse rounded motion-reduce:animate-none" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-line hover:bg-surface-muted/60 border-b transition-colors last:border-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        CELL,
                        'py-3.5',
                        column.align === 'right' && 'text-right',
                        column.className,
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

function HeaderLabel<T>({ column }: { column: Column<T> }) {
  if (column.mobileHeader === undefined) {
    return column.header;
  }
  if (column.mobileHeader === '') {
    return <span className="sr-only sm:not-sr-only">{column.header}</span>;
  }
  return (
    <>
      <span className="sm:hidden">{column.mobileHeader}</span>
      <span className="hidden sm:inline">{column.header}</span>
    </>
  );
}

function SortButton({
  label,
  active,
  order,
  onClick,
}: {
  label: string;
  active: boolean;
  order: SortOrder;
  onClick: () => void;
}) {
  const Icon = !active
    ? ChevronsUpDown
    : order === 'asc'
      ? ChevronUp
      : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'hover:text-ink inline-flex items-center gap-1 font-semibold',
        active && 'text-ink',
      )}
    >
      {label}
      <Icon
        aria-hidden="true"
        className={cn('size-3.5', !active && 'opacity-50')}
      />
    </button>
  );
}
