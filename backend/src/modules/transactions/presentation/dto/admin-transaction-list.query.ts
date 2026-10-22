import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { trim } from '../../../../shared/presentation/transforms.js';
import type { LedgerTransactionQuery } from '../../application/transaction-query.repository.js';
import type { LedgerTransactionType } from '../../domain/transaction.views.js';
import { TransactionListQuery } from './transaction-list.query.js';

const TYPES: LedgerTransactionType[] = ['transfer', 'topup'];

export class AdminTransactionListQuery extends TransactionListQuery {
  @ApiPropertyOptional({ enum: TYPES })
  @IsOptional()
  @IsIn(TYPES)
  type?: LedgerTransactionType;

  @ApiPropertyOptional({
    description: 'Exact username involved as sender or receiver.',
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  username?: string;

  toQuery(): LedgerTransactionQuery {
    return { ...this.toFilters(), type: this.type, username: this.username };
  }
}
