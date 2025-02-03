import type { Contract } from '@sneakers-store/contracts';
import type { initClient } from '@ts-rest/core';
import type { Adapter } from 'next-auth/adapters';
import {
  decodeToken,
  isAuthJsJwtLike,
  mapSessionDtoToAdapter,
  mapUserDtoToAdapter,
} from './utils.js';

type Client = ReturnType<
  typeof initClient<
    Contract,
    {
      baseUrl: string;
    }
  >
>;

const getNextAuthRestAdapter = (client: Client): Adapter => ({
  // https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-drizzle/src/lib/pg.ts
  async createUser(user) {
    const { name, image, ...rest } = user;
    const { body, status } = await client.users.createUser({
      body: {
        ...rest,
        emailVerified: user.emailVerified?.toISOString(),
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
        email: user.email,
      },
    });
    if (status !== 201) throw new Error('createUser error');
    return mapUserDtoToAdapter(body.data.user);
  },
  async getUser(id) {
    const { body, status } = await client.users.getUser({
      params: { userId: id },
    });
    if (status !== 200) throw new Error('getUser error');
    return body.data.user ? mapUserDtoToAdapter(body.data.user) : null;
  },
  async getUserByEmail(email) {
    const { body } = await client.users.getUsers({
      query: { email },
    });
    return body.data.users.length
      ? mapUserDtoToAdapter(body.data.users[0])
      : null;
  },
  async getUserByAccount({ provider, providerAccountId }) {
    const { body } = await client.users.getUsers({
      query: { provider, providerAccountId },
    });
    return body.data.users.length
      ? mapUserDtoToAdapter(body.data.users[0])
      : null;
  },
  async updateUser(user) {
    const { name, image, ...rest } = user;
    const { body } = await client.users.updateUser({
      params: { userId: user.id },
      body: {
        ...rest,
        // email: user.email,
        emailVerified: user.emailVerified?.toISOString(),
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
      },
    });
    if (body.status === 'success' && body.data.user) {
      return mapUserDtoToAdapter(body.data.user);
    } else {
      throw new Error(
        (body.status === 'error' && body.message) || 'Cannot update user'
      );
    }
  },
  async deleteUser(userId) {
    await client.users.deleteUser({ params: { userId } });
  },
  async linkAccount(account) {
    await client.accounts.createAccount({ body: account });
  },
  async unlinkAccount({ provider, providerAccountId }) {
    await client.accounts.deleteAccount({
      params: { provider, providerAccountId },
    });
  },
  async createSession(session) {
    const { body, status } = await client.sessions.createSession({
      body: {
        ...session,
        expires: session.expires.toISOString(),
      },
    });
    if (status !== 201) throw new Error('createSession error');
    return mapSessionDtoToAdapter(body.data.session);
  },
  async getSessionAndUser(sessionToken) {
    let sessionId = sessionToken;
    if (isAuthJsJwtLike(sessionToken)) {
      const payload = await decodeToken(sessionToken);
      if (payload?.sessionToken) sessionId = payload.sessionToken;
    }
    const { body } = await client.sessions.getSession({
      params: { sessionId },
    });
    if (body.data.session && body.data.user) {
      return {
        session: mapSessionDtoToAdapter(body.data.session),
        user: mapUserDtoToAdapter(body.data.user),
      };
    }
    return null;
  },
  async updateSession(session) {
    let sessionId = session.sessionToken;
    let expires = session.expires;
    let userId = session.userId;
    if (isAuthJsJwtLike(session.sessionToken)) {
      const payload = await decodeToken(session.sessionToken);
      if (payload?.sessionToken) {
        sessionId = payload.sessionToken;
        userId = payload.sub;
      }
    }
    const { body, status } = await client.sessions.updateSession({
      params: { sessionId },
      body: {
        sessionToken: sessionId,
        userId,
        expires: session.expires ? session.expires.toISOString() : undefined,
      },
    });
    if (status !== 200) throw new Error('updateSession error');
    return body.data.session ? mapSessionDtoToAdapter(body.data.session) : null;
  },
  async deleteSession(sessionToken) {
    let sessionId = sessionToken;
    if (isAuthJsJwtLike(sessionToken)) {
      const payload = await decodeToken(sessionToken);
      if (payload?.sessionToken) sessionId = payload.sessionToken;
    }
    const { body } = await client.sessions.deleteSession({
      params: { sessionId },
    });
    return body.data.session ? mapSessionDtoToAdapter(body.data.session) : null;
  },
});

export default getNextAuthRestAdapter;
