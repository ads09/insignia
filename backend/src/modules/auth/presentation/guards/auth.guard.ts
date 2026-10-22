import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../../users/application/user.repository.js';
import { TokenService } from '../../application/ports/token.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AuthenticatedRequest } from './authenticated-request.js';

const BEARER_PREFIX = /^Bearer\s+/i;

/**
 * Global guard: every route requires a valid token unless marked @Public().
 * Accepts both `Authorization: <token>` (as in the API spec) and
 * `Authorization: Bearer <token>`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    private readonly users: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization
      ?.replace(BEARER_PREFIX, '')
      .trim();
    const payload = token ? await this.tokens.verify(token) : null;
    // Looking the user up keeps the role current and rejects tokens of
    // users that no longer exist.
    const user = payload ? await this.users.findById(payload.sub) : null;

    if (!user) {
      throw new UnauthorizedException('User token not valid');
    }

    request.user = { id: user.id, username: user.username, role: user.role };
    return true;
  }
}
