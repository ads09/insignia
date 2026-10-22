import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenPayload,
  TokenService,
} from '../application/ports/token.service.js';

@Injectable()
export class JwtTokenService extends TokenService {
  constructor(private readonly jwt: JwtService) {
    super();
  }

  sign(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync({ sub: payload.sub });
  }

  async verify(token: string): Promise<TokenPayload | null> {
    try {
      const { sub } = await this.jwt.verifyAsync<TokenPayload>(token);
      return typeof sub === 'string' ? { sub } : null;
    } catch {
      return null;
    }
  }
}
