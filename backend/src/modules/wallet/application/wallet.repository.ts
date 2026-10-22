import { Amount } from '../../../shared/domain/amount.js';

export interface TransferData {
  senderId: string;
  receiverId: string;
  amount: Amount;
}

export abstract class WalletRepository {
  abstract getBalance(userId: string): Promise<number>;

  /** Credits the wallet and records the top-up, atomically. */
  abstract topUp(userId: string, amount: Amount): Promise<void>;

  /**
   * Moves funds and records the transfer, atomically. Implementations must
   * keep the sender's balance >= 0 even under concurrent transfers.
   *
   * @throws InsufficientBalanceError when the sender cannot cover the amount.
   */
  abstract transfer(data: TransferData): Promise<void>;
}
