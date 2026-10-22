import { mockWalletRepository } from '../../../../../test/utils/mocks.js';
import { GetBalanceUseCase } from './get-balance.use-case.js';

describe('GetBalanceUseCase', () => {
  it('returns the balance of the user', async () => {
    const wallets = mockWalletRepository();
    wallets.getBalance.mockResolvedValue(1000);

    await expect(
      new GetBalanceUseCase(wallets).execute('user-1'),
    ).resolves.toEqual({
      balance: 1000,
    });
    expect(wallets.getBalance).toHaveBeenCalledWith('user-1');
  });
});
