import { mockTransactionQueryRepository } from '../../../../../test/utils/mocks.js';
import {
  GetTopTransactionsForUserUseCase,
  TOP_TRANSACTIONS_LIMIT,
} from './get-top-transactions-for-user.use-case.js';

describe('GetTopTransactionsForUserUseCase', () => {
  it('returns the top 10 transfers of the user', async () => {
    const transactions = mockTransactionQueryRepository();
    const top = [
      { username: 'bob', amount: 100 },
      { username: 'carol', amount: -80 },
    ];
    transactions.findTopTransfersForUser.mockResolvedValue(top);

    await expect(
      new GetTopTransactionsForUserUseCase(transactions).execute('user-1'),
    ).resolves.toEqual(top);
    expect(TOP_TRANSACTIONS_LIMIT).toBe(10);
    expect(transactions.findTopTransfersForUser).toHaveBeenCalledWith(
      'user-1',
      10,
    );
  });
});
