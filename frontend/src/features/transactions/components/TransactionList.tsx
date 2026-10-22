import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toApiError } from '@/shared/api/api-error';
import { Button } from '@/shared/components/Button';
import { Pagination } from '@/shared/components/Pagination';
import { Panel } from '@/shared/components/Panel';
import { hasActiveFilters } from '../lib/filters';
import type { Page, TransactionFilters as Filters } from '../types';
import { TransactionFilters } from './TransactionFilters';
import { TransactionTable, type Column } from './TransactionTable';

interface TransactionListProps<Type extends string, T extends { id: string }> {
  filters: Filters<Type>;
  setFilters: (patch: Partial<Filters<Type>>) => void;
  resetFilters: () => void;
  query: UseQueryResult<Page<T>>;
  columns: Column<T>[];
  typeOptions: readonly { value: Type; label: string }[];
  searchLabel: string;
  showUsername?: boolean;
}

/** Filters, table and pagination of a transaction list. */
export function TransactionList<Type extends string, T extends { id: string }>({
  filters,
  setFilters,
  resetFilters,
  query,
  columns,
  typeOptions,
  searchLabel,
  showUsername,
}: TransactionListProps<Type, T>) {
  const meta = query.data?.meta;

  // A page past the end (rows removed, or an edited URL): go to the last page.
  useEffect(() => {
    if (meta && meta.total_pages > 0 && filters.page > meta.total_pages) {
      setFilters({ page: meta.total_pages });
    }
  }, [meta, filters.page, setFilters]);

  return (
    <Panel flush>
      <div className="p-4 sm:p-5">
        <TransactionFilters
          filters={filters}
          typeOptions={typeOptions}
          searchLabel={searchLabel}
          showUsername={showUsername}
          onChange={setFilters}
          onReset={resetFilters}
        />
      </div>
      <TransactionTable
        columns={columns}
        rows={query.data?.data}
        isPending={query.isPending}
        isFetching={query.isPlaceholderData}
        errorMessage={
          query.isError ? toApiError(query.error).message : undefined
        }
        onRetry={() => void query.refetch()}
        sort={filters.sort}
        order={filters.order}
        onSortChange={(sort, order) => setFilters({ sort, order })}
        emptyAction={
          hasActiveFilters(filters) && (
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Hapus filter
            </Button>
          )
        }
      />
      {meta && meta.total > 0 && (
        <div className="border-line border-t px-4 py-3 sm:px-5">
          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            totalPages={meta.total_pages}
            onPageChange={(page) => setFilters({ page })}
            onLimitChange={(limit) => setFilters({ limit })}
          />
        </div>
      )}
    </Panel>
  );
}
