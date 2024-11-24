import type { Contract } from '@sneakers-store/contracts';
import type { initClient } from '@ts-rest/core';
import type { Adapter } from 'next-auth/adapters';
import { mapSessionDtoToAdapter, mapUserDtoToAdapter } from './utils.js';

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
    const { body, status } = await client.createUser({
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
    const { body, status } = await client.getUser({ params: { userId: id } });
    if (status !== 200) throw new Error('getUser error');
    return body.data.user ? mapUserDtoToAdapter(body.data.user) : null;
  },
  async getUserByEmail(email) {
    const { body } = await client.getUserByAccountOrEmail({
      query: { email },
    });
    return body.data.user ? mapUserDtoToAdapter(body.data.user) : null;
  },
  async getUserByAccount({ provider, providerAccountId }) {
    const { body } = await client.getUserByAccountOrEmail({
      query: { provider, providerAccountId },
    });
    return body.data.user ? mapUserDtoToAdapter(body.data.user) : null;
  },
  async updateUser(user) {
    const { name, image, ...rest } = user;
    const { body } = await client.updateUser({
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
    await client.deleteUser({ params: { userId } });
  },
  async linkAccount(account) {
    await client.createAccount({ body: account });
  },
  async unlinkAccount({ provider, providerAccountId }) {
    await client.deleteAccount({
      params: { provider, providerAccountId },
    });
  },
  async createSession(session) {
    const { body, status } = await client.createSession({
      body: {
        ...session,
        expires: session.expires.toISOString(),
      },
    });
    if (status !== 201) throw new Error('createSession error');
    return mapSessionDtoToAdapter(body.data.session);
  },
  async getSessionAndUser(sessionToken) {
    const { body } = await client.getSession({
      params: { sessionId: sessionToken },
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
    const { body, status } = await client.updateSession({
      params: { sessionId: session.sessionToken },
      body: {
        ...session,
        expires: session.expires ? session.expires.toISOString() : undefined,
      },
    });
    if (status !== 200) throw new Error('updateSession error');
    return body.data.session ? mapSessionDtoToAdapter(body.data.session) : null;
  },
  async deleteSession(sessionToken) {
    const { body } = await client.deleteSession({
      params: { sessionId: sessionToken },
    });
    return body.data.session ? mapSessionDtoToAdapter(body.data.session) : null;
  },
});

export default getNextAuthRestAdapter;
