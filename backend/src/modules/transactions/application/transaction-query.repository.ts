import {
  PageRequest,
  SortOrder,
} from '../../../shared/application/pagination.js';
import {
  LedgerTransaction,
  LedgerTransactionType,
  TopTransaction,
  TopUser,
  UserTransaction,
  UserTransactionType,
} from '../domain/transaction.views.js';

export type TransactionSortField = 'createdAt' | 'amount';

export interface TransactionFilters {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  /** Bounds on the absolute transaction value. */
  minAmount?: number;
  maxAmount?: number;
  sort: TransactionSortField;
  order: SortOrder;
}

export interface UserTransactionQuery extends PageRequest, TransactionFilters {
  type?: UserTransactionType;
}

export interface LedgerTransactionQuery
  extends PageRequest, TransactionFilters {
  type?: LedgerTransactionType;
  /** Only transactions involving this user, as sender or receiver. */
  username?: string;
}

export interface QueryResult<T> {
  items: T[];
  total: number;
}

/** Read side of the transactions; writes happen in the wallet module. */
export abstract class TransactionQueryRepository {
  /** Transfers (credits and debits) of a user, largest absolute value first. */
  abstract findTopTransfersForUser(
    userId: string,
    limit: number,
  ): Promise<TopTransaction[]>;

  /** Users ranked by the total value of their outbound transfers. */
  abstract findTopSenders(limit: number): Promise<TopUser[]>;

  abstract findForUser(
    userId: string,
    query: UserTransactionQuery,
  ): Promise<QueryResult<UserTransaction>>;

  abstract findAll(
    query: LedgerTransactionQuery,
  ): Promise<QueryResult<LedgerTransaction>>;
}
