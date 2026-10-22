import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { SortOrder } from '../../../../shared/application/pagination.js';
import { trim } from '../../../../shared/presentation/transforms.js';
import type {
  TransactionFilters,
  TransactionSortField,
} from '../../application/transaction-query.repository.js';

const SORT_FIELDS = { created_at: 'createdAt', amount: 'amount' } as const;
type SortParam = keyof typeof SORT_FIELDS;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Query parameters shared by the user and the administrator lists. */
export class TransactionListQuery {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Case-insensitive username search.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  search?: string;

  @ApiPropertyOptional({
    description: 'ISO 8601 date or date-time (inclusive).',
    example: '2024-10-01',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  start_date?: string;

  @ApiPropertyOptional({
    description:
      'ISO 8601 date or date-time (inclusive). A date covers the whole day (UTC).',
    example: '2024-10-31',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  end_date?: string;

  @ApiPropertyOptional({ description: 'Minimum absolute amount.', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_amount?: number;

  @ApiPropertyOptional({ description: 'Maximum absolute amount.', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_amount?: number;

  @ApiPropertyOptional({
    enum: Object.keys(SORT_FIELDS),
    default: 'created_at',
  })
  @IsOptional()
  @IsIn(Object.keys(SORT_FIELDS))
  sort: SortParam = 'created_at';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: SortOrder = 'desc';

  protected toFilters(): TransactionFilters & { page: number; limit: number } {
    return {
      page: this.page,
      limit: this.limit,
      search: this.search,
      startDate: this.start_date ? new Date(this.start_date) : undefined,
      endDate: this.end_date ? toInclusiveEnd(this.end_date) : undefined,
      minAmount: this.min_amount,
      maxAmount: this.max_amount,
      sort: SORT_FIELDS[this.sort] satisfies TransactionSortField,
      order: this.order,
    };
  }
}

function toInclusiveEnd(value: string): Date {
  return DATE_ONLY.test(value)
    ? new Date(`${value}T23:59:59.999Z`)
    : new Date(value);
}
