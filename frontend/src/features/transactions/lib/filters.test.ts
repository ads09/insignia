import { describe, expect, it } from 'vitest';
import {
  hasActiveFilters,
  parseFilters,
  serializeFilters,
  toQueryParams,
} from './filters';

const TYPES = ['credit', 'debit', 'topup'] as const;
const parse = (query: string) =>
  parseFilters(new URLSearchParams(query), TYPES);

describe('transaction filters', () => {
  it('uses the defaults for an empty query', () => {
    expect(parse('')).toEqual({
      page: 1,
      limit: 10,
      sort: 'created_at',
      order: 'desc',
      search: undefined,
      type: undefined,
      start_date: undefined,
      end_date: undefined,
      min_amount: undefined,
      max_amount: undefined,
      username: undefined,
    });
  });

  it('reads valid values', () => {
    expect(
      parse(
        'page=3&limit=50&sort=amount&order=asc&search=+bob+&type=debit&start_date=2024-10-01&end_date=2024-10-31&min_amount=10&max_amount=99.5',
      ),
    ).toMatchObject({
      page: 3,
      limit: 50,
      sort: 'amount',
      order: 'asc',
      search: 'bob',
      type: 'debit',
      start_date: '2024-10-01',
      end_date: '2024-10-31',
      min_amount: 10,
      max_amount: 99.5,
    });
  });

  it('ignores invalid values', () => {
    expect(
      parse(
        'page=-1&limit=7&sort=username&order=up&type=transfer&start_date=yesterday&min_amount=-5&max_amount=abc',
      ),
    ).toMatchObject({
      page: 1,
      limit: 10,
      sort: 'created_at',
      order: 'desc',
      type: undefined,
      start_date: undefined,
      min_amount: undefined,
      max_amount: undefined,
    });
  });

  it('writes only non-default values to the URL', () => {
    const filters = {
      ...parse(''),
      page: 2,
      type: 'topup' as const,
      min_amount: 0,
    };
    expect(serializeFilters(filters).toString()).toBe(
      'page=2&type=topup&min_amount=0',
    );
  });

  it('round-trips through the URL', () => {
    const query =
      'page=2&limit=20&sort=amount&order=asc&search=bob&type=credit';
    expect(parse(serializeFilters(parse(query)).toString())).toEqual(
      parse(query),
    );
  });

  it('knows when filters narrow the results', () => {
    expect(hasActiveFilters(parse('page=4&sort=amount'))).toBe(false);
    expect(hasActiveFilters(parse('min_amount=0'))).toBe(true);
  });

  it('drops unset values from the request parameters', () => {
    expect(toQueryParams(parse('search=bob'))).toEqual({
      page: 1,
      limit: 10,
      sort: 'created_at',
      order: 'desc',
      search: 'bob',
    });
  });
});
