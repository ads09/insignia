import type { Request } from 'express';
import { AuthenticatedUser } from '../../domain/authenticated-user.js';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
