import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { EnvironmentVariables } from '../../config/env.validation.js';
import { UsersModule } from '../users/users.module.js';
import { PasswordHasher } from './application/ports/password-hasher.js';
import { TokenService } from './application/ports/token.service.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher.js';
import { JwtTokenService } from './infrastructure/jwt-token.service.js';
import { AuthController } from './presentation/auth.controller.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';
import { UserController } from './presentation/user.controller.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          // Validated as a non-empty string; jsonwebtoken parses values like "1d".
          expiresIn: config.get('JWT_EXPIRES_IN', {
            infer: true,
          }) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    { provide: TokenService, useClass: JwtTokenService },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    // Order matters: authentication runs before role checks.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
