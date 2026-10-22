import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  aUser,
  mockTokenService,
  mockUserRepository,
} from '../../../../../test/utils/mocks.js';
import { AuthGuard } from './auth.guard.js';

function createContext(authorization?: string) {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers: authorization ? { authorization } : {},
  };
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('AuthGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  const tokens = mockTokenService();
  const users = mockUserRepository();
  const guard = new AuthGuard(reflector as unknown as Reflector, tokens, users);

  beforeEach(() => {
    vi.resetAllMocks();
    reflector.getAllAndOverride.mockReturnValue(false);
  });

  it('lets public routes through without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(createContext().context)).resolves.toBe(
      true,
    );
    expect(tokens.verify).not.toHaveBeenCalled();
  });

  it.each(['token-123', 'Bearer token-123', 'bearer   token-123'])(
    'accepts the header "%s" and attaches the user',
    async (header) => {
      tokens.verify.mockResolvedValue({ sub: 'user-1' });
      users.findById.mockResolvedValue(aUser({ role: 'ADMIN' }));
      const { context, request } = createContext(header);

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(tokens.verify).toHaveBeenCalledWith('token-123');
      expect(request.user).toEqual({
        id: 'user-1',
        username: 'alice',
        role: 'ADMIN',
      });
    },
  );

  it('rejects a missing token', async () => {
    await expect(guard.canActivate(createContext().context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an invalid token', async () => {
    tokens.verify.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext('garbage').context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token of a user that no longer exists', async () => {
    tokens.verify.mockResolvedValue({ sub: 'deleted-user' });
    users.findById.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext('token-123').context),
    ).rejects.toThrow(UnauthorizedException);
  });
});
