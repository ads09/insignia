import type { ActivityTransaction } from '../api/activity.api';

export const ACTIVITY_DAYS = 30;

export interface BalancePoint {
  /** Milliseconds since the epoch. */
  time: number;
  balance: number;
}

export interface ActivitySummary {
  incoming: number;
  outgoing: number;
  topups: number;
  count: number;
}

/** Start of the activity period as YYYY-MM-DD (UTC, as the API reads dates). */
export function activityStart(now: Date, days = ACTIVITY_DAYS): string {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString().slice(0, 10);
}

/**
 * Rebuilds the balance over time from the current balance and the
 * transactions, newest first: before each transaction the balance was the
 * balance after it minus its (signed) amount. Returns points oldest first,
 * from `from` (or the oldest transaction, when not all were loaded) to `now`.
 */
export function balanceHistory(
  balance: number,
  transactions: ActivityTransaction[],
  { from, now, complete }: { from: number; now: number; complete: boolean },
): BalancePoint[] {
  const points: BalancePoint[] = [{ time: now, balance }];
  let running = balance;
  for (const transaction of transactions) {
    points.push({
      time: new Date(transaction.created_at).getTime(),
      balance: running,
    });
    running = round(running - transaction.amount);
  }
  const oldest = transactions.at(-1);
  if (complete || !oldest) {
    points.push({ time: from, balance: running });
  } else {
    // The balance before the oldest loaded transaction is still right; the
    // line just starts there instead of at the start of the period.
    points.push({
      time: new Date(oldest.created_at).getTime() - 1,
      balance: running,
    });
  }
  return points.reverse();
}

export function summarize(
  transactions: ActivityTransaction[],
): ActivitySummary {
  const summary: ActivitySummary = {
    incoming: 0,
    outgoing: 0,
    topups: 0,
    count: 0,
  };
  for (const { type, amount } of transactions) {
    summary.count++;
    if (type === 'credit') summary.incoming = round(summary.incoming + amount);
    if (type === 'debit') summary.outgoing = round(summary.outgoing - amount);
    if (type === 'topup') summary.topups = round(summary.topups + amount);
  }
  return summary;
}

/** Amounts have at most 8 decimals; this removes floating point noise. */
function round(value: number): number {
  return Math.round(value * 1e8) / 1e8;
}
