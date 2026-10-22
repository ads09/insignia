import { mockTransactionQueryRepository } from '../../../../../test/utils/mocks.js';
import { InvalidTransactionQueryError } from '../../domain/invalid-transaction-query.error.js';
import { UserTransaction } from '../../domain/transaction.views.js';
import { UserTransactionQuery } from '../transaction-query.repository.js';
import { ListUserTransactionsUseCase } from './list-user-transactions.use-case.js';

describe('ListUserTransactionsUseCase', () => {
  const transactions = mockTransactionQueryRepository();
  const useCase = new ListUserTransactionsUseCase(transactions);
  const query: UserTransactionQuery = {
    page: 2,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
  };
  const item: UserTransaction = {
    id: 'tx-1',
    type: 'debit',
    counterpartyUsername: 'bob',
    amount: -50,
    createdAt: new Date('2024-10-01T00:00:00Z'),
  };

  beforeEach(() => vi.resetAllMocks());

  it('returns a page of the user transactions', async () => {
    transactions.findForUser.mockResolvedValue({ items: [item], total: 11 });

    await expect(useCase.execute('user-1', query)).resolves.toEqual({
      data: [item],
      meta: { page: 2, limit: 10, total: 11, totalPages: 2 },
    });
    expect(transactions.findForUser).toHaveBeenCalledWith('user-1', query);
  });

  it('rejects a start date after the end date', async () => {
    await expect(
      useCase.execute('user-1', {
        ...query,
        startDate: new Date('2024-10-02'),
        endDate: new Date('2024-10-01'),
      }),
    ).rejects.toBeInstanceOf(InvalidTransactionQueryError);
    expect(transactions.findForUser).not.toHaveBeenCalled();
  });

  it('rejects a minimum amount greater than the maximum', async () => {
    await expect(
      useCase.execute('user-1', { ...query, minAmount: 10, maxAmount: 5 }),
    ).rejects.toBeInstanceOf(InvalidTransactionQueryError);
  });
});
