import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { getSession } from '../shared/libs/next-auth/getSession.js';
import type { UserEntity } from '../db/schemas/user.schema.js';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private drizzleService: DrizzleService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = await getSession(req, this.drizzleService.db);

    if (session?.user) {
      req.user = session.user as UserEntity;
    }
    next();
  }
}
