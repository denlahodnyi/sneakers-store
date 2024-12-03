import { SetMetadata } from '@nestjs/common';

import { type Role, type UserEntity } from '../db/schemas/user.schema.js';

export interface ConditionObject {
  params?: Record<string, any>;
  roles?: Role[];
}

export type ConditionsHandler = (user: UserEntity) => ConditionObject[];

export const IS_AUTH_CONDITION_KEY = 'isAuthCondition';
export const AuthConditions = (handler: ConditionsHandler) =>
  SetMetadata(IS_AUTH_CONDITION_KEY, handler);
