import { Injectable } from '@nestjs/common';
import { WalletRepository } from '../wallet.repository.js';

@Injectable()
export class GetBalanceUseCase {
  constructor(private readonly wallets: WalletRepository) {}

  async execute(userId: string): Promise<{ balance: number }> {
    return { balance: await this.wallets.getBalance(userId) };
  }
}
