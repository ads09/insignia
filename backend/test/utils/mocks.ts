import type { Mocked } from 'vitest';
import type { PasswordHasher } from '../../src/modules/auth/application/ports/password-hasher.js';
import type { TokenService } from '../../src/modules/auth/application/ports/token.service.js';
import type { TransactionQueryRepository } from '../../src/modules/transactions/application/transaction-query.repository.js';
import type { UserRepository } from '../../src/modules/users/application/user.repository.js';
import type { User } from '../../src/modules/users/domain/user.js';
import type { WalletRepository } from '../../src/modules/wallet/application/wallet.repository.js';

export function mockUserRepository(): Mocked<UserRepository> {
  return { create: vi.fn(), findById: vi.fn(), findByUsername: vi.fn() };
}

export function mockWalletRepository(): Mocked<WalletRepository> {
  return { getBalance: vi.fn(), topUp: vi.fn(), transfer: vi.fn() };
}

export function mockTransactionQueryRepository(): Mocked<TransactionQueryRepository> {
  return {
    findTopTransfersForUser: vi.fn(),
    findTopSenders: vi.fn(),
    findForUser: vi.fn(),
    findAll: vi.fn(),
  };
}

export function mockTokenService(): Mocked<TokenService> {
  return { sign: vi.fn(), verify: vi.fn() };
}

export function mockPasswordHasher(): Mocked<PasswordHasher> {
  return { hash: vi.fn(), compare: vi.fn() };
}

export function aUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    username: 'alice',
    passwordHash: 'hashed-password',
    role: 'USER',
    ...overrides,
  };
}
