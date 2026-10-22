import { User } from '../domain/user.js';

export interface CreateUserData {
  username: string;
  passwordHash: string | null;
}

export abstract class UserRepository {
  /** @throws UsernameAlreadyExistsError when the username is taken. */
  abstract create(data: CreateUserData): Promise<User>;

  abstract findById(id: string): Promise<User | null>;

  abstract findByUsername(username: string): Promise<User | null>;
}
