import { mockWalletRepository } from '../../../../../test/utils/mocks.js';
import { Amount } from '../../../../shared/domain/amount.js';
import { InvalidAmountError } from '../../../../shared/domain/invalid-amount.error.js';
import { TopUpUseCase } from './top-up.use-case.js';

describe('TopUpUseCase', () => {
  const wallets = mockWalletRepository();
  const useCase = new TopUpUseCase(wallets);

  beforeEach(() => vi.resetAllMocks());

  it.each([0.01, 1000, 9_999_999.99])('tops up %s', async (amount) => {
    await useCase.execute({ userId: 'user-1', amount });

    expect(wallets.topUp).toHaveBeenCalledWith('user-1', Amount.of(amount));
  });

  it.each([0, -1, 10_000_000, 10_000_000.01, 1.123456789])(
    'rejects %s as an invalid topup amount',
    async (amount) => {
      await expect(
        useCase.execute({ userId: 'user-1', amount }),
      ).rejects.toThrow(new InvalidAmountError('Invalid topup amount'));
      expect(wallets.topUp).not.toHaveBeenCalled();
    },
  );
});
