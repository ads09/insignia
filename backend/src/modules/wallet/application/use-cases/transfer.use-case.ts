import { Injectable } from '@nestjs/common';
import { Amount } from '../../../../shared/domain/amount.js';
import { UserRepository } from '../../../users/application/user.repository.js';
import { RecipientNotFoundError } from '../../domain/recipient-not-found.error.js';
import { SelfTransferError } from '../../domain/self-transfer.error.js';
import { WalletRepository } from '../wallet.repository.js';

export interface TransferCommand {
  sender: { id: string; username: string };
  toUsername: string;
  amount: number;
}

@Injectable()
export class TransferUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly wallets: WalletRepository,
  ) {}

  async execute({
    sender,
    toUsername,
    amount,
  }: TransferCommand): Promise<void> {
    const transferAmount = Amount.of(amount, 'Invalid transfer amount');
    if (toUsername === sender.username) {
      throw new SelfTransferError();
    }

    const recipient = await this.users.findByUsername(toUsername);
    if (!recipient) {
      throw new RecipientNotFoundError();
    }

    await this.wallets.transfer({
      senderId: sender.id,
      receiverId: recipient.id,
      amount: transferAmount,
    });
  }
}
