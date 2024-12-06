import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getSession as getNextAuthSession } from '@auth/express';
import type { Request } from 'express';
import type { Adapter, AdapterSession, AdapterUser } from 'next-auth/adapters';
import {
  SESSION_COOKIE_NAME,
  isAuthJsJwtLike,
  decodeToken,
} from '@sneakers-store/next-auth';
import type { DefaultPostgresSchema } from 'node_modules/@auth/drizzle-adapter/lib/pg.js';

import type { DrizzleService } from '../../../drizzle/drizzle.service.js';
import {
  accountsTable,
  sessionsTable,
  usersTable,
  type SessionEntity,
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
    cookies: {
      sessionToken: {
        name: SESSION_COOKIE_NAME,
      },
    },
  });
}

type Db = Parameters<typeof DrizzleAdapter>[0];
type Schema = Extract<
  Parameters<typeof DrizzleAdapter>[1],
  DefaultPostgresSchema
>;

function getAdapter(db: Db): Adapter {
  const drizzleAdapter = DrizzleAdapter(db, {
    accountsTable,
    sessionsTable,
    usersTable,
    // Custom schema stores dates as strings, so we need to apply explicit
    // type assertion
  } as unknown as Schema);
  return {
    // ...(drizzleAdapter as Adapter),
    getUser() {
      throw new Error('not implement method');
    },
    getUserByAccount() {
      throw new Error('not implement method');
    },
    getUserByEmail() {
      throw new Error('not implement method');
    },
    getAccount() {
      throw new Error('not implement method');
    },
    getAuthenticator() {
      throw new Error('not implement method');
    },
    createUser() {
      throw new Error('not implement method');
    },
    createAuthenticator() {
      throw new Error('not implement method');
    },
    createVerificationToken() {
      throw new Error('not implement method');
    },
    updateUser() {
      throw new Error('not implement method');
    },
    linkAccount() {
      throw new Error('not implement method');
    },
    unlinkAccount() {
      throw new Error('not implement method');
    },
    updateAuthenticatorCounter() {
      throw new Error('not implement method');
    },
    useVerificationToken() {
      throw new Error('not implement method');
    },
    listAuthenticatorsByUserId() {
      throw new Error('not implement method');
    },
    // We need only sessions specific methods here
    async getSessionAndUser(sessionToken) {
      let sessionId = sessionToken;
      if (isAuthJsJwtLike(sessionToken)) {
        const payload = await decodeToken(sessionToken);
        if (payload?.sessionToken) sessionId = payload.sessionToken;
      }
      const result = (await drizzleAdapter.getSessionAndUser?.(sessionId)) as {
        session: SessionEntity;
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
      const result = await drizzleAdapter.createSession?.(formattedSession);
      return mapSessionDtoToAdapter(result as unknown as SessionEntity);
    },
    async updateSession(session) {
      const formattedSession = {
        ...session,
        expires: session.expires
          ? (session.expires.toISOString() as any as Date)
          : undefined,
      };
      const result = await drizzleAdapter.updateSession?.(formattedSession);
      return result
        ? mapSessionDtoToAdapter(result as unknown as SessionEntity)
        : null;
    },
    async deleteSession(sessionToken) {
      let sessionId = sessionToken;
      if (isAuthJsJwtLike(sessionToken)) {
        const payload = await decodeToken(sessionToken);
        if (payload?.sessionToken) sessionId = payload.sessionToken;
      }
      const result = await drizzleAdapter.deleteSession?.(sessionId);
      return result
        ? mapSessionDtoToAdapter(result as unknown as SessionEntity)
        : null;
    },
  };
}

const mapUserDtoToAdapter = (user: UserEntity): AdapterUser => {
  return {
    ...user,
    email: user.email as AdapterUser['email'],
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
};

const mapSessionDtoToAdapter = (session: SessionEntity): AdapterSession => {
  return {
    ...session,
    expires: new Date(session.expires),
  };
};
