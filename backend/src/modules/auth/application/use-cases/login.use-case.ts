import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/application/user.repository.js';
import { InvalidCredentialsError } from '../../domain/invalid-credentials.error.js';
import { PasswordHasher } from '../ports/password-hasher.js';
import { TokenService } from '../ports/token.service.js';

export interface LoginCommand {
  username: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute({
    username,
    password,
  }: LoginCommand): Promise<{ token: string }> {
    const user = await this.users.findByUsername(username);
    const isValid =
      user?.passwordHash != null &&
      (await this.passwordHasher.compare(password, user.passwordHash));

    // Unknown user, password-less user and wrong password are
    // indistinguishable to the caller.
    if (!user || !isValid) {
      throw new InvalidCredentialsError();
    }

    return { token: await this.tokens.sign({ sub: user.id }) };
  }
}
