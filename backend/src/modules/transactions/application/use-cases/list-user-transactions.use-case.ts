import { Injectable } from '@nestjs/common';
import { Page, toPage } from '../../../../shared/application/pagination.js';
import { UserTransaction } from '../../domain/transaction.views.js';
import { assertValidFilters } from '../assert-valid-filters.js';
import {
  TransactionQueryRepository,
  UserTransactionQuery,
} from '../transaction-query.repository.js';

@Injectable()
export class ListUserTransactionsUseCase {
  constructor(private readonly transactions: TransactionQueryRepository) {}

  async execute(
    userId: string,
    query: UserTransactionQuery,
  ): Promise<Page<UserTransaction>> {
    assertValidFilters(query);
    const { items, total } = await this.transactions.findForUser(userId, query);
    return toPage(items, total, query);
  }
}
