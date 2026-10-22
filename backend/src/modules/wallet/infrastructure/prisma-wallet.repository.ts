import { Injectable } from '@nestjs/common';
import { Amount } from '../../../shared/domain/amount.js';
import { decimalToNumber } from '../../../shared/infrastructure/prisma/decimal.js';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import {
  TransferData,
  WalletRepository,
} from '../application/wallet.repository.js';
import { InsufficientBalanceError } from '../domain/insufficient-balance.error.js';

@Injectable()
export class PrismaWalletRepository extends WalletRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getBalance(userId: string): Promise<number> {
    const { balance } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { balance: true },
    });
    return decimalToNumber(balance);
  }

  async topUp(userId: string, amount: Amount): Promise<void> {
    const value = amount.toString();
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: value } },
      }),
      this.prisma.transaction.create({
        data: { type: 'TOPUP', receiverId: userId, amount: value },
      }),
    ]);
  }

  async transfer({
    senderId,
    receiverId,
    amount,
  }: TransferData): Promise<void> {
    const value = amount.toString();
    await this.prisma.$transaction(async (tx) => {
      // Lock both wallets in a deterministic order so that opposite transfers
      // running concurrently (A -> B and B -> A) cannot deadlock.
      await tx.$queryRaw`
        SELECT id FROM users
        WHERE id IN (${senderId}::uuid, ${receiverId}::uuid)
        ORDER BY id
        FOR UPDATE`;

      // Conditional debit: only succeeds when the balance covers the amount,
      // so the balance can never become negative.
      const { count } = await tx.user.updateMany({
        where: { id: senderId, balance: { gte: value } },
        data: { balance: { decrement: value } },
      });
      if (count === 0) {
        throw new InsufficientBalanceError();
      }

      await tx.user.update({
        where: { id: receiverId },
        data: { balance: { increment: value } },
      });
      await tx.transaction.create({
        data: { type: 'TRANSFER', senderId, receiverId, amount: value },
      });
    });
  }
}
