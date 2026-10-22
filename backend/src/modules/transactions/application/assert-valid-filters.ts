import { InvalidTransactionQueryError } from '../domain/invalid-transaction-query.error.js';
import { TransactionFilters } from './transaction-query.repository.js';

export function assertValidFilters({
  startDate,
  endDate,
  minAmount,
  maxAmount,
}: TransactionFilters): void {
  if (startDate && endDate && startDate > endDate) {
    throw new InvalidTransactionQueryError(
      'start_date must not be after end_date',
    );
  }
  if (
    minAmount !== undefined &&
    maxAmount !== undefined &&
    minAmount > maxAmount
  ) {
    throw new InvalidTransactionQueryError(
      'min_amount must not be greater than max_amount',
    );
  }
}
