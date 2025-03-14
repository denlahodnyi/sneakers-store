import NextAuth, { AuthError } from 'next-auth';
import { getNextAuthConfig } from '@sneakers-store/next-auth';

import { getClient } from './serverContractsClient';

const client = getClient();

export const { handlers, signIn, signOut, auth } = NextAuth(
  getNextAuthConfig(client, 'dashboard'),
);

export { AuthError };
