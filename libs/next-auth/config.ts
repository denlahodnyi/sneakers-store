import type { User, NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import { encode as defaultEncode } from 'next-auth/jwt';
import Google from 'next-auth/providers/google';
import type { initClient } from '@ts-rest/core';
import type { Contract, UserResponseDto } from '@sneakers-store/contracts';

import getNextAuthRestAdapter from './rest-adapter.js';
import { SESSION_COOKIE_NAME } from './constants.js';
import { createSessionObject } from './utils.js';

declare module 'next-auth' {
  interface User extends UserResponseDto {
    sessionToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sessionToken?: string;
    role: UserResponseDto['role'];
  }
}

export const getNextAuthConfig = (
  client: ReturnType<typeof initClient<Contract, { baseUrl: string }>>,
  app: 'store' | 'dashboard',
  otherOptions: Pick<Partial<NextAuthConfig>, 'debug' | 'providers'> = {
    debug: false,
    providers: [],
  }
): NextAuthConfig => ({
  debug: otherOptions?.debug || false,
  session: {
    strategy: 'database',
  },
  providers: [
    // For only Credentials provider to work its important to add Google (or any
    // other provider). It fixes UnsupportedStrategy: Signing in with credentials only supported if JWT strategy is enabled.
    Google,
    ...(otherOptions?.providers || []),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async ({ email, password }) => {
        const signInResult = await client.users.signIn({
          body: {
            email,
            password,
            // Should have been signIn callback, but we use asAdmin as a workaround
            asAdmin: app === 'dashboard' || undefined,
          } as { email: string; password: string },
        });
        if (signInResult.body.status === 'success') {
          const user = signInResult.body.data.user;
          const session = createSessionObject(user.id);
          const result = await client.sessions.createSession({ body: session });

          if (result.body.status === 'success') {
            const createdSession = result.body.data.session;
            const user: User = signInResult.body.data.user;
            // Pass sessionToken down to JWT callback
            user.sessionToken = createdSession.sessionToken;
            return user;
          } else {
            throw new Error('Cannot create session');
          }
        }
        if (signInResult.body.status === 'error') {
          const exception = new Error(
            signInResult.body.message || 'Cannot sign-in'
          );
          exception.cause = signInResult.body;
          throw exception;
        }
        throw new Error('Invalid credentials');
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // (!!!) Auth.js still creates session if signIn returns false, so asAdmin
      // is used with Credentials provider

      // At dashboard only admins can sign in
      // if (app === 'dashboard') {
      //   return user.role === 'super_admin' || user.role === 'admin';
      // }
      return true;
    },
    async jwt({ token, account, user }) {
      // if (account?.provider === 'credentials' && user.sessionToken) {
      //   token.isCredentials = true;
      //   token.sessionToken = user.sessionToken;
      // }
      // return token;

      token.sessionToken = user.sessionToken;
      token.role = user.role;
      return token;
    },
  },
  jwt: {
    async encode(params) {
      // if (params.token?.isCredentials && params.token.sessionToken) {
      //   // We need to save sessionToken in session cookie to allow fetching
      //   // session. Default behavior prevents it by creating JWT token and
      //   // placing it in cookie, so it must be disabled.
      //   return params.token.sessionToken as string;
      // }
      return defaultEncode(params);
    },
  },
  // events: {
  //   signIn(msg) {
  //     console.log('SignIn ev', msg);
  //   },
  //   signOut(msg) {
  //     console.log('SignOut ev', msg);
  //   },
  //   session(msg) {
  //     console.log('Session ev', msg);
  //   },
  //   createUser(msg) {
  //     console.log('CreateUser ev', msg);
  //   },
  //   linkAccount(msg) {
  //     console.log('LinkAcc ev', msg);
  //   },
  // },
  adapter: getNextAuthRestAdapter(client),
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
    },
  },
});
