import { eq, getTableColumns } from 'drizzle-orm';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  SessionCreateDto,
  SessionUpdateDto,
} from '@sneakers-store/contracts';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { sessionsTable, usersTable } from '../db/schemas/user.schema.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...omitPassword } = getTableColumns(usersTable);

@Controller('sessions')
export class SessionsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @TsRestHandler(c.sessions.createSession)
  async createSession(
    @Body(ConfiguredValidationPipe) createSessionDto: SessionCreateDto,
  ) {
    return tsRestHandler(c.sessions.createSession, async () => {
      const [session] = await this.drizzleService.db
        .insert(sessionsTable)
        .values(createSessionDto)
        .returning();
      return { status: 201, body: { status: 'success', data: { session } } };
    });
  }

  @Get(':sessionId')
  @TsRestHandler(c.sessions.getSession)
  async getUserAndSessionBySessionId(@Param('sessionId') sessionId: string) {
    return tsRestHandler(c.sessions.getSession, async () => {
      const [result] = await this.drizzleService.db
        .select({ users: omitPassword, sessions: sessionsTable })
        .from(sessionsTable)
        .where(eq(sessionsTable.sessionToken, sessionId))
        .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId));
      return result?.sessions && result?.users
        ? {
            status: 200,
            body: {
              status: 'success',
              data: { session: result.sessions, user: result.users },
            },
          }
        : {
            status: 200,
            body: { status: 'success', data: { session: null, user: null } },
          };
    });
  }

  @Patch(':sessionId')
  @TsRestHandler(c.sessions.updateSession)
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body(ConfiguredValidationPipe) updateSessionDto: SessionUpdateDto,
  ) {
    return tsRestHandler(c.sessions.updateSession, async () => {
      const [session = null] = await this.drizzleService.db
        .update(sessionsTable)
        .set(updateSessionDto)
        .where(eq(sessionsTable.sessionToken, sessionId))
        .returning();
      return {
        status: 200,
        body: { status: 'success', data: { session } },
      };
    });
  }

  @Delete(':sessionId')
  @TsRestHandler(c.sessions.deleteSession)
  async deleteSession(@Param('sessionId') sessionId: string) {
    return tsRestHandler(c.sessions.deleteSession, async () => {
      const [session = null] = await this.drizzleService.db
        .delete(sessionsTable)
        .where(eq(sessionsTable.sessionToken, sessionId))
        .returning();
      return {
        status: 200,
        body: { status: 'success', data: { session } },
      };
    });
  }
}
