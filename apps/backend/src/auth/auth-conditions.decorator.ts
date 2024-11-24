import { SetMetadata } from '@nestjs/common';

import { Role, type UserEntity } from '../db/schemas/user.schema.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const roles = Object.values(Role);

export interface ConditionObject {
  params?: Record<string, any>;
  roles?: typeof roles;
}

export type ConditionsHandler = (user: UserEntity) => ConditionObject[];

export const IS_AUTH_CONDITION_KEY = 'isAuthCondition';
export const AuthConditions = (handler: ConditionsHandler) =>
  SetMetadata(IS_AUTH_CONDITION_KEY, handler);
