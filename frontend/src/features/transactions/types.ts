export type SortField = 'created_at' | 'amount';
export type SortOrder = 'asc' | 'desc';

export type UserTransactionType = 'credit' | 'debit' | 'topup';
export type LedgerTransactionType = 'transfer' | 'topup';

/** A transaction seen from the signed-in user's wallet. */
export interface UserTransaction {
  id: string;
  type: UserTransactionType;
  /** The other party of a transfer; `null` for topups. */
  username: string | null;
  /** Negative for debits. */
  amount: number;
  created_at: string;
}

/** A transaction in the ledger of all users (administrators only). */
export interface LedgerTransaction {
  id: string;
  type: LedgerTransactionType;
  /** `null` for topups. */
  from_username: string | null;
  to_username: string;
  amount: number;
  created_at: string;
}

export interface Page<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

/** Query parameters of `GET /transactions` and `GET /admin/transactions`. */
export interface TransactionFilters<Type extends string = string> {
  page: number;
  limit: number;
  sort: SortField;
  order: SortOrder;
  search?: string;
  type?: Type;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  /** Administrator list only: exact username of the sender or receiver. */
  username?: string;
}
