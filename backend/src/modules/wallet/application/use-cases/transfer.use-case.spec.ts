import {
  aUser,
  mockUserRepository,
  mockWalletRepository,
} from '../../../../../test/utils/mocks.js';
import { Amount } from '../../../../shared/domain/amount.js';
import { InvalidAmountError } from '../../../../shared/domain/invalid-amount.error.js';
import { InsufficientBalanceError } from '../../domain/insufficient-balance.error.js';
import { RecipientNotFoundError } from '../../domain/recipient-not-found.error.js';
import { SelfTransferError } from '../../domain/self-transfer.error.js';
import { TransferUseCase } from './transfer.use-case.js';

describe('TransferUseCase', () => {
  const users = mockUserRepository();
  const wallets = mockWalletRepository();
  const useCase = new TransferUseCase(users, wallets);
  const sender = { id: 'sender-id', username: 'alice' };

  beforeEach(() => {
    vi.resetAllMocks();
    users.findByUsername.mockResolvedValue(
      aUser({ id: 'receiver-id', username: 'bob' }),
    );
  });

  it('transfers the amount to the destination user', async () => {
    await useCase.execute({ sender, toUsername: 'bob', amount: 100 });

    expect(users.findByUsername).toHaveBeenCalledWith('bob');
    expect(wallets.transfer).toHaveBeenCalledWith({
      senderId: 'sender-id',
      receiverId: 'receiver-id',
      amount: Amount.of(100),
    });
  });

  it.each([0, -10, 0.000000001])('rejects the amount %s', async (amount) => {
    await expect(
      useCase.execute({ sender, toUsername: 'bob', amount }),
    ).rejects.toBeInstanceOf(InvalidAmountError);
    expect(wallets.transfer).not.toHaveBeenCalled();
  });

  it('rejects a transfer to oneself', async () => {
    await expect(
      useCase.execute({ sender, toUsername: 'alice', amount: 10 }),
    ).rejects.toBeInstanceOf(SelfTransferError);
    expect(users.findByUsername).not.toHaveBeenCalled();
  });

  it('rejects an unknown destination user', async () => {
    users.findByUsername.mockResolvedValue(null);

    await expect(
      useCase.execute({ sender, toUsername: 'ghost', amount: 10 }),
    ).rejects.toBeInstanceOf(RecipientNotFoundError);
    expect(wallets.transfer).not.toHaveBeenCalled();
  });

  it('propagates an insufficient balance', async () => {
    wallets.transfer.mockRejectedValue(new InsufficientBalanceError());

    await expect(
      useCase.execute({ sender, toUsername: 'bob', amount: 10 }),
    ).rejects.toBeInstanceOf(InsufficientBalanceError);
  });

  it('validates the amount before looking up the destination', async () => {
    users.findByUsername.mockResolvedValue(null);

    await expect(
      useCase.execute({ sender, toUsername: 'ghost', amount: 0 }),
    ).rejects.toBeInstanceOf(InvalidAmountError);
  });
});
