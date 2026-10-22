import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { decimalToNumber } from '../../../shared/infrastructure/prisma/decimal.js';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import {
  LedgerTransactionQuery,
  QueryResult,
  TransactionFilters,
  TransactionQueryRepository,
  UserTransactionQuery,
} from '../application/transaction-query.repository.js';
import {
  LedgerTransaction,
  TopTransaction,
  TopUser,
  UserTransaction,
} from '../domain/transaction.views.js';

const WITH_PARTIES = {
  sender: { select: { username: true } },
  receiver: { select: { username: true } },
} satisfies Prisma.TransactionInclude;

type TransactionWithParties = Prisma.TransactionGetPayload<{
  include: typeof WITH_PARTIES;
}>;

@Injectable()
export class PrismaTransactionQueryRepository extends TransactionQueryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findTopTransfersForUser(
    userId: string,
    limit: number,
  ): Promise<TopTransaction[]> {
    // The stored amount is always positive, so ordering by it ranks the
    // transfers by absolute value regardless of their direction.
    const rows = await this.prisma.transaction.findMany({
      where: {
        type: 'TRANSFER',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: WITH_PARTIES,
      orderBy: [{ amount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return rows.map((row) => {
      const isDebit = row.senderId === userId;
      const amount = decimalToNumber(row.amount);
      return {
        // Transfers always have a sender (enforced by a CHECK constraint).
        username: isDebit ? row.receiver.username : row.sender!.username,
        amount: isDebit ? -amount : amount,
      };
    });
  }

  async findTopSenders(limit: number): Promise<TopUser[]> {
    // LEFT JOIN keeps users without debits, ranked last with a value of 0.
    const rows = await this.prisma.$queryRaw<
      { username: string; transacted_value: Prisma.Decimal }[]
    >`
      SELECT u.username, COALESCE(SUM(t.amount), 0) AS transacted_value
      FROM users u
      LEFT JOIN transactions t
        ON t.sender_id = u.id AND t.type = 'TRANSFER'
      GROUP BY u.id, u.username
      ORDER BY transacted_value DESC, u.username ASC
      LIMIT ${limit}`;

    return rows.map((row) => ({
      username: row.username,
      transactedValue: decimalToNumber(row.transacted_value),
    }));
  }

  async findForUser(
    userId: string,
    query: UserTransactionQuery,
  ): Promise<QueryResult<UserTransaction>> {
    const where: Prisma.TransactionWhereInput = {
      AND: [
        { OR: [{ senderId: userId }, { receiverId: userId }] },
        userTypeFilter(userId, query.type),
        query.search
          ? {
              OR: [
                { senderId: userId, receiver: usernameContains(query.search) },
                {
                  receiverId: userId,
                  type: 'TRANSFER',
                  sender: usernameContains(query.search),
                },
              ],
            }
          : {},
        commonFilters(query),
      ],
    };

    const [rows, total] = await this.findPage(where, query);
    return {
      items: rows.map((row) => toUserTransaction(row, userId)),
      total,
    };
  }

  async findAll(
    query: LedgerTransactionQuery,
  ): Promise<QueryResult<LedgerTransaction>> {
    const where: Prisma.TransactionWhereInput = {
      AND: [
        query.type
          ? { type: query.type === 'topup' ? 'TOPUP' : 'TRANSFER' }
          : {},
        query.username
          ? {
              OR: [
                { sender: { username: query.username } },
                { receiver: { username: query.username } },
              ],
            }
          : {},
        query.search
          ? {
              OR: [
                { sender: usernameContains(query.search) },
                { receiver: usernameContains(query.search) },
              ],
            }
          : {},
        commonFilters(query),
      ],
    };

    const [rows, total] = await this.findPage(where, query);
    return { items: rows.map(toLedgerTransaction), total };
  }

  /** Fetches one page and the total count concurrently. */
  private findPage(
    where: Prisma.TransactionWhereInput,
    { page, limit, sort, order }: UserTransactionQuery | LedgerTransactionQuery,
  ): Promise<[TransactionWithParties[], number]> {
    return Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: WITH_PARTIES,
        // The id tie-breaker keeps pagination stable for equal sort values.
        orderBy: [{ [sort]: order }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);
  }
}

function userTypeFilter(
  userId: string,
  type: UserTransactionQuery['type'],
): Prisma.TransactionWhereInput {
  switch (type) {
    case 'credit':
      return { type: 'TRANSFER', receiverId: userId };
    case 'debit':
      return { type: 'TRANSFER', senderId: userId };
    case 'topup':
      return { type: 'TOPUP', receiverId: userId };
    default:
      return {};
  }
}

function usernameContains(search: string): Prisma.UserWhereInput {
  return { username: { contains: search, mode: 'insensitive' } };
}

function commonFilters({
  startDate,
  endDate,
  minAmount,
  maxAmount,
}: TransactionFilters): Prisma.TransactionWhereInput {
  return {
    createdAt: { gte: startDate, lte: endDate },
    amount: { gte: minAmount, lte: maxAmount },
  };
}

function toUserTransaction(
  row: TransactionWithParties,
  userId: string,
): UserTransaction {
  const amount = decimalToNumber(row.amount);
  const base = { id: row.id, createdAt: row.createdAt };

  if (row.type === 'TOPUP') {
    return { ...base, type: 'topup', counterpartyUsername: null, amount };
  }
  if (row.senderId === userId) {
    return {
      ...base,
      type: 'debit',
      counterpartyUsername: row.receiver.username,
      amount: -amount,
    };
  }
  return {
    ...base,
    type: 'credit',
    counterpartyUsername: row.sender!.username,
    amount,
  };
}

function toLedgerTransaction(row: TransactionWithParties): LedgerTransaction {
  return {
    id: row.id,
    type: row.type === 'TOPUP' ? 'topup' : 'transfer',
    fromUsername: row.sender?.username ?? null,
    toUsername: row.receiver.username,
    amount: decimalToNumber(row.amount),
    createdAt: row.createdAt,
  };
}
