import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { parseFilters, serializeFilters } from '../lib/filters';
import type { TransactionFilters } from '../types';

/**
 * The list filters, kept in the URL query string so that a filtered list can
 * be refreshed, bookmarked and shared. Changing a filter returns to page 1.
 */
export function useTransactionFilters<Type extends string>(
  types: readonly Type[],
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => parseFilters(searchParams, types),
    [searchParams, types],
  );

  const setFilters = useCallback(
    (patch: Partial<TransactionFilters<Type>>) => {
      setSearchParams(
        (current) => {
          const next = { ...parseFilters(current, types), page: 1, ...patch };
          return serializeFilters(next);
        },
        { replace: !('page' in patch) },
      );
    },
    [setSearchParams, types],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (current) => {
        const { limit, sort, order } = parseFilters(current, types);
        return serializeFilters({ page: 1, limit, sort, order });
      },
      { replace: true },
    );
  }, [setSearchParams, types]);

  return { filters, setFilters, resetFilters };
}
