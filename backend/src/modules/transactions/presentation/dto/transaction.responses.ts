import { ApiProperty } from '@nestjs/swagger';
import type {
  Page,
  PageMeta,
} from '../../../../shared/application/pagination.js';
import type {
  LedgerTransaction,
  LedgerTransactionType,
  TopTransaction,
  TopUser,
  UserTransaction,
  UserTransactionType,
} from '../../domain/transaction.views.js';

export class TopTransactionResponse {
  @ApiProperty({ example: 'user123' })
  username: string;

  @ApiProperty({ example: -80, description: 'Negative for debits.' })
  amount: number;

  static from({ username, amount }: TopTransaction): TopTransactionResponse {
    return { username, amount };
  }
}

export class TopUserResponse {
  @ApiProperty({ example: 'user1234' })
  username: string;

  @ApiProperty({
    example: 10000,
    description:
      'Total aggregated value of all the debit transactions for the user.',
  })
  transacted_value: number;

  static from({ username, transactedValue }: TopUser): TopUserResponse {
    return { username, transacted_value: transactedValue };
  }
}

export class PageMetaResponse {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 5 })
  total_pages: number;

  static from({ page, limit, total, totalPages }: PageMeta): PageMetaResponse {
    return { page, limit, total, total_pages: totalPages };
  }
}

export class UserTransactionResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ['credit', 'debit', 'topup'] })
  type: UserTransactionType;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'user456',
    description: 'Counterparty of the transfer; null for top-ups.',
  })
  username: string | null;

  @ApiProperty({ example: -80, description: 'Negative for debits.' })
  amount: number;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  static from(transaction: UserTransaction): UserTransactionResponse {
    return {
      id: transaction.id,
      type: transaction.type,
      username: transaction.counterpartyUsername,
      amount: transaction.amount,
      created_at: transaction.createdAt.toISOString(),
    };
  }
}

export class UserTransactionPageResponse {
  @ApiProperty({ type: [UserTransactionResponse] })
  data: UserTransactionResponse[];

  @ApiProperty({ type: PageMetaResponse })
  meta: PageMetaResponse;

  static from(page: Page<UserTransaction>): UserTransactionPageResponse {
    return {
      data: page.data.map((item) => UserTransactionResponse.from(item)),
      meta: PageMetaResponse.from(page.meta),
    };
  }
}

export class LedgerTransactionResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ['transfer', 'topup'] })
  type: LedgerTransactionType;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'user123',
    description: 'Null for top-ups.',
  })
  from_username: string | null;

  @ApiProperty({ example: 'user456' })
  to_username: string;

  @ApiProperty({ example: 80 })
  amount: number;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  static from(transaction: LedgerTransaction): LedgerTransactionResponse {
    return {
      id: transaction.id,
      type: transaction.type,
      from_username: transaction.fromUsername,
      to_username: transaction.toUsername,
      amount: transaction.amount,
      created_at: transaction.createdAt.toISOString(),
    };
  }
}

export class LedgerTransactionPageResponse {
  @ApiProperty({ type: [LedgerTransactionResponse] })
  data: LedgerTransactionResponse[];

  @ApiProperty({ type: PageMetaResponse })
  meta: PageMetaResponse;

  static from(page: Page<LedgerTransaction>): LedgerTransactionPageResponse {
    return {
      data: page.data.map((item) => LedgerTransactionResponse.from(item)),
      meta: PageMetaResponse.from(page.meta),
    };
  }
}
