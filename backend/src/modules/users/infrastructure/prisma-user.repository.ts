import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { isUniqueConstraintViolation } from '../../../shared/infrastructure/prisma/prisma-errors.js';
import {
  CreateUserData,
  UserRepository,
} from '../application/user.repository.js';
import { User } from '../domain/user.js';
import { UsernameAlreadyExistsError } from '../domain/username-already-exists.error.js';

const USER_FIELDS = {
  id: true,
  username: true,
  passwordHash: true,
  role: true,
} as const;

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: CreateUserData): Promise<User> {
    try {
      return await this.prisma.user.create({ data, select: USER_FIELDS });
    } catch (error) {
      // Relying on the unique index (instead of check-then-insert) keeps
      // concurrent registrations of the same username race-free.
      if (isUniqueConstraintViolation(error)) {
        throw new UsernameAlreadyExistsError();
      }
      throw error;
    }
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id }, select: USER_FIELDS });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: USER_FIELDS,
    });
  }
}
