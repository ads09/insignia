import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { UserTransactionQuery } from '../../application/transaction-query.repository.js';
import type { UserTransactionType } from '../../domain/transaction.views.js';
import { TransactionListQuery } from './transaction-list.query.js';

const TYPES: UserTransactionType[] = ['credit', 'debit', 'topup'];

export class UserTransactionListQuery extends TransactionListQuery {
  @ApiPropertyOptional({ enum: TYPES })
  @IsOptional()
  @IsIn(TYPES)
  type?: UserTransactionType;

  toQuery(): UserTransactionQuery {
    return { ...this.toFilters(), type: this.type };
  }
}
