import { Injectable } from '@nestjs/common';
import { TopUser } from '../../domain/transaction.views.js';
import { TransactionQueryRepository } from '../transaction-query.repository.js';

export const TOP_USERS_LIMIT = 10;

@Injectable()
export class GetTopUsersUseCase {
  constructor(private readonly transactions: TransactionQueryRepository) {}

  execute(): Promise<TopUser[]> {
    return this.transactions.findTopSenders(TOP_USERS_LIMIT);
  }
}
