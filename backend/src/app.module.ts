import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { WalletModule } from './modules/wallet/wallet.module.js';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    WalletModule,
    TransactionsModule,
  ],
})
export class AppModule {}
