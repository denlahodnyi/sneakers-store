import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { getSession } from '../shared/libs/next-auth/getSession.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import type { UserEntity } from '../db/schemas/user.schema.js';
import {
  IS_AUTH_CONDITION_KEY,
  type ConditionsHandler,
} from './auth-conditions.decorator.js';

declare module 'express' {
  interface Request {
    user?: UserEntity;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private drizzleService: DrizzleService,
    private reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getClass(),
      ctx.getHandler(),
    ]);

    if (isPublic) return true;

    const handler = this.reflector.getAllAndOverride<
      ConditionsHandler | undefined
    >(IS_AUTH_CONDITION_KEY, [ctx.getClass(), ctx.getHandler()]);

    const request = ctx.switchToHttp().getRequest<Request>();
    const session = await getSession(request, this.drizzleService.db);
    if (session?.user) {
      request.user = session.user as UserEntity;
      if (handler) {
        const allow = checkConditions(handler(request.user), request);
        if (!allow) {
          throw new ForbiddenException('You cannot access that resource');
        }
        return true;
      }
      return true;
    } else {
      throw new UnauthorizedException('You need to login to have access');
    }
  }
}

// Check every object and return single boolean value. Fields inside object are
// combined using AND. Objects are combined using OR.
const checkConditions = (
  conditions: ReturnType<ConditionsHandler>,
  req: Request,
) => {
  type Condition = (typeof conditions)[number];
  const results = conditions.map((obj) => {
    return Object.entries(obj).every(
      ([key, fields]: [keyof Condition, Condition[keyof Condition]]) => {
        if (key === 'roles' && fields) {
          return fields.includes((req.user as UserEntity).role);
        }
        if (key === 'params' && fields) {
          return Object.entries(
            fields as NonNullable<Condition['params']>,
          ).every(([param, value]) => req.params[param] === value);
        }
      },
    );
  });
  return results.some((shouldPass) => shouldPass);
};
