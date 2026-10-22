import { Injectable } from '@nestjs/common';
import { TopTransaction } from '../../domain/transaction.views.js';
import { TransactionQueryRepository } from '../transaction-query.repository.js';

export const TOP_TRANSACTIONS_LIMIT = 10;

@Injectable()
export class GetTopTransactionsForUserUseCase {
  constructor(private readonly transactions: TransactionQueryRepository) {}

  execute(userId: string): Promise<TopTransaction[]> {
    return this.transactions.findTopTransfersForUser(
      userId,
      TOP_TRANSACTIONS_LIMIT,
    );
  }
}
