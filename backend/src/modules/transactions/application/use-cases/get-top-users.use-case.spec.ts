import { mockTransactionQueryRepository } from '../../../../../test/utils/mocks.js';
import { GetTopUsersUseCase } from './get-top-users.use-case.js';

describe('GetTopUsersUseCase', () => {
  it('returns the top 10 senders', async () => {
    const transactions = mockTransactionQueryRepository();
    const top = [{ username: 'alice', transactedValue: 10_000 }];
    transactions.findTopSenders.mockResolvedValue(top);

    await expect(
      new GetTopUsersUseCase(transactions).execute(),
    ).resolves.toEqual(top);
    expect(transactions.findTopSenders).toHaveBeenCalledWith(10);
  });
});
