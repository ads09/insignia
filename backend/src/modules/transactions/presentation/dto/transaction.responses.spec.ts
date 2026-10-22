import {
  LedgerTransactionPageResponse,
  TopUserResponse,
  UserTransactionPageResponse,
} from './transaction.responses.js';

describe('Transaction responses', () => {
  const createdAt = new Date('2024-10-01T10:00:00.000Z');
  const meta = { page: 1, limit: 10, total: 1, totalPages: 1 };

  it('maps top users to snake_case', () => {
    expect(
      TopUserResponse.from({ username: 'alice', transactedValue: 5 }),
    ).toEqual({
      username: 'alice',
      transacted_value: 5,
    });
  });

  it('maps a page of user transactions', () => {
    expect(
      UserTransactionPageResponse.from({
        data: [
          {
            id: 'tx-1',
            type: 'debit',
            counterpartyUsername: 'bob',
            amount: -80,
            createdAt,
          },
        ],
        meta,
      }),
    ).toEqual({
      data: [
        {
          id: 'tx-1',
          type: 'debit',
          username: 'bob',
          amount: -80,
          created_at: '2024-10-01T10:00:00.000Z',
        },
      ],
      meta: { page: 1, limit: 10, total: 1, total_pages: 1 },
    });
  });

  it('maps a page of ledger transactions', () => {
    expect(
      LedgerTransactionPageResponse.from({
        data: [
          {
            id: 'tx-1',
            type: 'topup',
            fromUsername: null,
            toUsername: 'alice',
            amount: 1000,
            createdAt,
          },
        ],
        meta,
      }).data,
    ).toEqual([
      {
        id: 'tx-1',
        type: 'topup',
        from_username: null,
        to_username: 'alice',
        amount: 1000,
        created_at: '2024-10-01T10:00:00.000Z',
      },
    ]);
  });
});
