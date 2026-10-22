import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../users/domain/user.js';

export const ROLES_KEY = 'roles';

/** Restricts a route to callers having one of the given roles. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
