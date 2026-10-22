import { mockTransactionQueryRepository } from '../../../../../test/utils/mocks.js';
import { InvalidTransactionQueryError } from '../../domain/invalid-transaction-query.error.js';
import { LedgerTransaction } from '../../domain/transaction.views.js';
import { LedgerTransactionQuery } from '../transaction-query.repository.js';
import { ListAllTransactionsUseCase } from './list-all-transactions.use-case.js';

describe('ListAllTransactionsUseCase', () => {
  const transactions = mockTransactionQueryRepository();
  const useCase = new ListAllTransactionsUseCase(transactions);
  const query: LedgerTransactionQuery = {
    page: 1,
    limit: 20,
    sort: 'amount',
    order: 'asc',
    type: 'transfer',
    username: 'alice',
  };
  const item: LedgerTransaction = {
    id: 'tx-1',
    type: 'transfer',
    fromUsername: 'alice',
    toUsername: 'bob',
    amount: 50,
    createdAt: new Date('2024-10-01T00:00:00Z'),
  };

  beforeEach(() => vi.resetAllMocks());

  it('returns a page of all transactions', async () => {
    transactions.findAll.mockResolvedValue({ items: [item], total: 1 });

    await expect(useCase.execute(query)).resolves.toEqual({
      data: [item],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    expect(transactions.findAll).toHaveBeenCalledWith(query);
  });

  it('rejects invalid filters', async () => {
    await expect(
      useCase.execute({ ...query, minAmount: 10, maxAmount: 1 }),
    ).rejects.toBeInstanceOf(InvalidTransactionQueryError);
    expect(transactions.findAll).not.toHaveBeenCalled();
  });
});
