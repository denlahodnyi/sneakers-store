import NextAuth, { AuthError, type Session } from 'next-auth';
import { getNextAuthConfig } from '@sneakers-store/next-auth';

import { getServerClient } from './contractsServerClient';

const client = getServerClient();

export const { handlers, signIn, signOut, auth } = NextAuth(
  getNextAuthConfig(client, 'store'),
);

export { AuthError };
export type { Session };
