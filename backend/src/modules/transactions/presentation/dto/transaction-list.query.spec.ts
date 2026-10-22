import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminTransactionListQuery } from './admin-transaction-list.query.js';
import { UserTransactionListQuery } from './user-transaction-list.query.js';

async function parse<T extends object>(
  type: new () => T,
  params: Record<string, string>,
) {
  const query = plainToInstance(type, params);
  return { query, errors: await validate(query) };
}

describe('Transaction list queries', () => {
  it('applies defaults', async () => {
    const { query, errors } = await parse(UserTransactionListQuery, {});

    expect(errors).toHaveLength(0);
    expect(query.toQuery()).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sort: 'createdAt',
      order: 'desc',
      type: undefined,
    });
  });

  it('converts query string values', async () => {
    const { query, errors } = await parse(UserTransactionListQuery, {
      page: '3',
      limit: '25',
      search: '  bob ',
      type: 'debit',
      start_date: '2024-10-01',
      end_date: '2024-10-31',
      min_amount: '10',
      max_amount: '99.5',
      sort: 'amount',
      order: 'asc',
    });

    expect(errors).toHaveLength(0);
    expect(query.toQuery()).toEqual({
      page: 3,
      limit: 25,
      search: 'bob',
      type: 'debit',
      startDate: new Date('2024-10-01T00:00:00.000Z'),
      // A date-only end bound covers the whole day.
      endDate: new Date('2024-10-31T23:59:59.999Z'),
      minAmount: 10,
      maxAmount: 99.5,
      sort: 'amount',
      order: 'asc',
    });
  });

  it('keeps an explicit end date-time as is', async () => {
    const { query } = await parse(UserTransactionListQuery, {
      end_date: '2024-10-31T12:00:00Z',
    });

    expect(query.toQuery().endDate).toEqual(new Date('2024-10-31T12:00:00Z'));
  });

  it.each<Record<string, string>>([
    { page: '0' },
    { limit: '101' },
    { type: 'transfer' },
    { sort: 'username' },
    { order: 'up' },
    { start_date: 'yesterday' },
    { min_amount: '-1' },
  ])('rejects %o for the user list', async (params) => {
    const { errors } = await parse(UserTransactionListQuery, params);

    expect(errors).not.toHaveLength(0);
  });

  it('accepts admin-only filters', async () => {
    const { query, errors } = await parse(AdminTransactionListQuery, {
      type: 'topup',
      username: 'alice',
    });

    expect(errors).toHaveLength(0);
    expect(query.toQuery()).toMatchObject({ type: 'topup', username: 'alice' });
  });

  it('rejects user-only types for the admin list', async () => {
    const { errors } = await parse(AdminTransactionListQuery, {
      type: 'debit',
    });

    expect(errors).not.toHaveLength(0);
  });
});
