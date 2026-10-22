import { describe, expect, it } from 'vitest';
import type { ActivityTransaction } from '../api/activity.api';
import { activityStart, balanceHistory, summarize } from './activity';

const at = (iso: string) => new Date(iso).getTime();

// Newest first, as the API returns them.
const TRANSACTIONS: ActivityTransaction[] = [
  { type: 'debit', amount: -30, created_at: '2024-10-20T10:00:00.000Z' },
  { type: 'credit', amount: 50.5, created_at: '2024-10-10T10:00:00.000Z' },
  { type: 'topup', amount: 100, created_at: '2024-10-05T10:00:00.000Z' },
];

describe('activityStart', () => {
  it('goes back the given number of days', () => {
    expect(activityStart(new Date('2024-10-31T15:00:00Z'), 30)).toBe(
      '2024-10-01',
    );
  });
});

describe('balanceHistory', () => {
  it('rebuilds the balance before each transaction', () => {
    const points = balanceHistory(120.5, TRANSACTIONS, {
      from: at('2024-10-01T00:00:00Z'),
      now: at('2024-10-31T00:00:00Z'),
      complete: true,
    });

    expect(points.map((point) => point.balance)).toEqual([
      0, 100, 150.5, 120.5, 120.5,
    ]);
    expect(points[0]?.time).toBe(at('2024-10-01T00:00:00Z'));
    expect(points.at(-1)?.time).toBe(at('2024-10-31T00:00:00Z'));
  });

  it('starts at the oldest loaded transaction when the list is incomplete', () => {
    const points = balanceHistory(120.5, TRANSACTIONS, {
      from: at('2024-10-01T00:00:00Z'),
      now: at('2024-10-31T00:00:00Z'),
      complete: false,
    });

    expect(points[0]).toEqual({
      time: at('2024-10-05T10:00:00.000Z') - 1,
      balance: 0,
    });
  });

  it('is a flat line without transactions', () => {
    const points = balanceHistory(42, [], { from: 0, now: 10, complete: true });
    expect(points).toEqual([
      { time: 0, balance: 42 },
      { time: 10, balance: 42 },
    ]);
  });
});

describe('summarize', () => {
  it('adds up money in, money out and topups', () => {
    expect(summarize(TRANSACTIONS)).toEqual({
      incoming: 50.5,
      outgoing: 30,
      topups: 100,
      count: 3,
    });
  });
});
