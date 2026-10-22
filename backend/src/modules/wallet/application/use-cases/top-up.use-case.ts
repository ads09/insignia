import { Injectable } from '@nestjs/common';
import { Amount } from '../../../../shared/domain/amount.js';
import { InvalidAmountError } from '../../../../shared/domain/invalid-amount.error.js';
import { WalletRepository } from '../wallet.repository.js';

/** Top-ups must be strictly below this value (assignment rule). */
export const TOP_UP_LIMIT = 10_000_000;

const INVALID_TOP_UP_AMOUNT = 'Invalid topup amount';

export interface TopUpCommand {
  userId: string;
  amount: number;
}

@Injectable()
export class TopUpUseCase {
  constructor(private readonly wallets: WalletRepository) {}

  async execute({ userId, amount }: TopUpCommand): Promise<void> {
    const topUpAmount = Amount.of(amount, INVALID_TOP_UP_AMOUNT);
    if (topUpAmount.isGreaterThanOrEqual(TOP_UP_LIMIT)) {
      throw new InvalidAmountError(INVALID_TOP_UP_AMOUNT);
    }

    await this.wallets.topUp(userId, topUpAmount);
  }
}
