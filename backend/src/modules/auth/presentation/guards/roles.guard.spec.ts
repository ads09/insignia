import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../users/domain/user.js';
import { RolesGuard } from './roles.guard.js';

function createContext(role: Role) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: '1', username: 'alice', role } }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  it('allows routes without role requirements', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext(Role.USER))).toBe(true);
  });

  it('allows a caller with a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(createContext(Role.ADMIN))).toBe(true);
  });

  it('forbids a caller without a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(createContext(Role.USER))).toThrow(
      ForbiddenException,
    );
  });
});
