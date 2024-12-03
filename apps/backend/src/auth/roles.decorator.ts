import { SetMetadata } from '@nestjs/common';

import { type Role } from '../db/schemas/user.schema.js';

export const ROLES_DECORATOR_KEY = 'roles';
export const Roles = (roles: Role[]) => SetMetadata(ROLES_DECORATOR_KEY, roles);
