import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/application/user.repository.js';
import { PasswordHasher } from '../ports/password-hasher.js';
import { TokenService } from '../ports/token.service.js';

export interface RegisterUserCommand {
  username: string;
  password?: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute({
    username,
    password,
  }: RegisterUserCommand): Promise<{ token: string }> {
    const passwordHash =
      password === undefined ? null : await this.passwordHasher.hash(password);
    // Public registration always creates a regular user (role defaults to USER).
    const user = await this.users.create({ username, passwordHash });
    return { token: await this.tokens.sign({ sub: user.id }) };
  }
}
