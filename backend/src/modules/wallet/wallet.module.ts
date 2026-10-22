import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { GetBalanceUseCase } from './application/use-cases/get-balance.use-case.js';
import { TopUpUseCase } from './application/use-cases/top-up.use-case.js';
import { TransferUseCase } from './application/use-cases/transfer.use-case.js';
import { WalletRepository } from './application/wallet.repository.js';
import { PrismaWalletRepository } from './infrastructure/prisma-wallet.repository.js';
import { WalletController } from './presentation/wallet.controller.js';

@Module({
  imports: [UsersModule],
  controllers: [WalletController],
  providers: [
    GetBalanceUseCase,
    TopUpUseCase,
    TransferUseCase,
    { provide: WalletRepository, useClass: PrismaWalletRepository },
  ],
})
export class WalletModule {}
