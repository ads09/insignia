import { Role } from '../../users/domain/user.js';

/** Identity of the caller, resolved from a valid token. */
export interface AuthenticatedUser {
  id: string;
  username: string;
  role: Role;
}
