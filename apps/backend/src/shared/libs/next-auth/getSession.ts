import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getSession as getNextAuthSession } from '@auth/express';
import type { Request } from 'express';
import type { Adapter, AdapterSession, AdapterUser } from 'next-auth/adapters';

import type { DrizzleService } from '../../../drizzle/drizzle.service.js';
import {
  accountsTable,
  sessionsTable,
  usersTable,
  type UserEntity,
} from '../../../db/schemas/user.schema.js';

export async function getSession(req: Request, db: DrizzleService['db']) {
  return getNextAuthSession(req, {
    session: {
      strategy: 'database',
    },
    providers: [],
    adapter: getAdapter(db),
    callbacks: {
      session({ session }) {
        return session;
      },
    },
  });
}

type Db = Parameters<typeof DrizzleAdapter>[0];
type Schema = Parameters<typeof DrizzleAdapter>[1];

function getAdapter(db: Db): Adapter {
  const drizzleAdapter = DrizzleAdapter(db, {
    accountsTable,
    sessionsTable,
    usersTable,
    // Custom schema stores dates as strings, so we need to apply explicit
    // type assertion
  } as any as Schema);
  return {
    ...drizzleAdapter,
    // We need only sessions specific methods here
    async getSessionAndUser(sessionToken) {
      const result = (await drizzleAdapter.getSessionAndUser?.(
        sessionToken,
      )) as {
        session: AdapterSession;
        user: UserEntity;
      } | null;
      if (result) {
        return {
          user: mapUserDtoToAdapter(result.user),
          session: mapSessionDtoToAdapter(result.session),
        };
      }
      return result;
    },
    async createSession(session) {
      const formattedSession = {
        ...session,
        expires: session.expires.toISOString() as any as Date,
      };
      const result = (await drizzleAdapter.createSession?.(
        formattedSession,
      )) as AdapterSession;
      return mapSessionDtoToAdapter(result);
    },
    async updateSession(session) {
      const formattedSession = {
        ...session,
        expires: session.expires
          ? (session.expires.toISOString() as any as Date)
          : undefined,
      };
      const result = (await drizzleAdapter.updateSession?.(
        formattedSession,
      )) as AdapterSession;
      return mapSessionDtoToAdapter(result);
    },
  };
}

const mapUserDtoToAdapter = (user: UserEntity): AdapterUser => {
  return {
    ...user,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  } as AdapterUser;
};

const mapSessionDtoToAdapter = (session: {
  sessionToken: string;
  userId: string;
  expires: Date;
}): AdapterSession => {
  return {
    ...session,
    expires: new Date(session.expires),
  };
};
