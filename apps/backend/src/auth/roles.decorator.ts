import { SetMetadata } from '@nestjs/common';
import type { Role } from '@sneakers-store/contracts';

export const ROLES_DECORATOR_KEY = 'roles';
export const Roles = (roles: Role[]) => SetMetadata(ROLES_DECORATOR_KEY, roles);
