/** A transaction seen from one user's wallet. */
export type UserTransactionType = 'credit' | 'debit' | 'topup';

export interface UserTransaction {
  id: string;
  type: UserTransactionType;
  /** The other party of a transfer; null for top-ups. */
  counterpartyUsername: string | null;
  /** Negative for debits. */
  amount: number;
  createdAt: Date;
}

/** A transaction seen from the whole system (administrators). */
export type LedgerTransactionType = 'transfer' | 'topup';

export interface LedgerTransaction {
  id: string;
  type: LedgerTransactionType;
  /** Null for top-ups. */
  fromUsername: string | null;
  toUsername: string;
  /** Always positive. */
  amount: number;
  createdAt: Date;
}

/** A transfer of one user, as returned by the top transactions ranking. */
export interface TopTransaction {
  /** The other party of the transfer. */
  username: string;
  /** Negative for debits. */
  amount: number;
}

export interface TopUser {
  username: string;
  /** Total value of the user's outbound transfers. */
  transactedValue: number;
}
