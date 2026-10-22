import { Injectable } from '@nestjs/common';
import { Page, toPage } from '../../../../shared/application/pagination.js';
import { LedgerTransaction } from '../../domain/transaction.views.js';
import { assertValidFilters } from '../assert-valid-filters.js';
import {
  LedgerTransactionQuery,
  TransactionQueryRepository,
} from '../transaction-query.repository.js';

@Injectable()
export class ListAllTransactionsUseCase {
  constructor(private readonly transactions: TransactionQueryRepository) {}

  async execute(
    query: LedgerTransactionQuery,
  ): Promise<Page<LedgerTransaction>> {
    assertValidFilters(query);
    const { items, total } = await this.transactions.findAll(query);
    return toPage(items, total, query);
  }
}
