import { Module } from '@nestjs/common';
import { TransactionQueryRepository } from './application/transaction-query.repository.js';
import { GetTopTransactionsForUserUseCase } from './application/use-cases/get-top-transactions-for-user.use-case.js';
import { GetTopUsersUseCase } from './application/use-cases/get-top-users.use-case.js';
import { ListAllTransactionsUseCase } from './application/use-cases/list-all-transactions.use-case.js';
import { ListUserTransactionsUseCase } from './application/use-cases/list-user-transactions.use-case.js';
import { PrismaTransactionQueryRepository } from './infrastructure/prisma-transaction-query.repository.js';
import { AdminTransactionsController } from './presentation/admin-transactions.controller.js';
import { TransactionsController } from './presentation/transactions.controller.js';

@Module({
  controllers: [TransactionsController, AdminTransactionsController],
  providers: [
    GetTopTransactionsForUserUseCase,
    GetTopUsersUseCase,
    ListUserTransactionsUseCase,
    ListAllTransactionsUseCase,
    {
      provide: TransactionQueryRepository,
      useClass: PrismaTransactionQueryRepository,
    },
  ],
})
export class TransactionsModule {}
