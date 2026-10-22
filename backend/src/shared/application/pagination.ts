export type SortOrder = 'asc' | 'desc';

export interface PageRequest {
  page: number;
  limit: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export function toPage<T>(
  data: T[],
  total: number,
  { page, limit }: PageRequest,
): Page<T> {
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
