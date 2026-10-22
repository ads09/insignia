import { PAGE_SIZES } from '@/shared/config/pagination';
import type { SortField, SortOrder, TransactionFilters } from '../types';

export const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  sort: 'created_at',
  order: 'desc',
} as const satisfies Partial<TransactionFilters>;

const SORT_FIELDS: readonly SortField[] = ['created_at', 'amount'];
const SORT_ORDERS: readonly SortOrder[] = ['asc', 'desc'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const oneOf = <T extends string>(values: readonly T[], value: string | null) =>
  values.find((candidate) => candidate === value);

function text(value: string | null): string | undefined {
  return value?.trim() || undefined;
}

function amount(value: string | null): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

/**
 * Reads the filters from the URL. Invalid or unknown values fall back to the
 * defaults, so a hand-edited URL never produces a request the API rejects.
 */
export function parseFilters<Type extends string>(
  params: URLSearchParams,
  types: readonly Type[],
): TransactionFilters<Type> {
  const page = Number(params.get('page'));
  const limit = Number(params.get('limit'));
  const startDate = params.get('start_date');
  const endDate = params.get('end_date');

  return {
    page: Number.isInteger(page) && page >= 1 ? page : DEFAULT_FILTERS.page,
    limit: (PAGE_SIZES as readonly number[]).includes(limit)
      ? limit
      : DEFAULT_FILTERS.limit,
    sort: oneOf(SORT_FIELDS, params.get('sort')) ?? DEFAULT_FILTERS.sort,
    order: oneOf(SORT_ORDERS, params.get('order')) ?? DEFAULT_FILTERS.order,
    search: text(params.get('search')),
    type: oneOf(types, params.get('type')),
    start_date: startDate && DATE.test(startDate) ? startDate : undefined,
    end_date: endDate && DATE.test(endDate) ? endDate : undefined,
    min_amount: amount(params.get('min_amount')),
    max_amount: amount(params.get('max_amount')),
    username: text(params.get('username')),
  };
}

/** Writes the filters to the URL, leaving out empty and default values. */
export function serializeFilters(filters: TransactionFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    const isDefault =
      DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS] === value;
    if (value !== undefined && value !== '' && !isDefault) {
      params.set(key, String(value));
    }
  }
  return params;
}

/** Whether any filter that narrows the results is set (sorting and paging aside). */
export function hasActiveFilters(filters: TransactionFilters): boolean {
  const {
    search,
    type,
    start_date,
    end_date,
    min_amount,
    max_amount,
    username,
  } = filters;
  return [
    search,
    type,
    start_date,
    end_date,
    min_amount,
    max_amount,
    username,
  ].some((value) => value !== undefined);
}

/** The request parameters: the filters without the unset ones. */
export function toQueryParams(
  filters: TransactionFilters,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number>;
}
