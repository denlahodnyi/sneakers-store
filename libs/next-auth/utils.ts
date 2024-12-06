import type {
  SessionResponseDto,
  UserResponseDto,
} from '@sneakers-store/contracts';
import type { AdapterSession, AdapterUser } from 'next-auth/adapters';
import { decode as decodeJWT } from 'next-auth/jwt';
import { SESSION_COOKIE_NAME } from './constants.js';

export const mapUserDtoToAdapter = (user: UserResponseDto): AdapterUser => {
  return {
    ...user,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  } as AdapterUser;
};

export const mapSessionDtoToAdapter = (
  session: SessionResponseDto
): AdapterSession => {
  return {
    ...session,
    expires: new Date(session.expires),
  };
};

export const createSessionObject = (
  userId: string
): {
  sessionToken: string;
  userId: string;
  expires: string;
} => ({
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days,
  userId,
  sessionToken: crypto.randomUUID(),
});

export const isAuthJsJwtLike = (token: string) => {
  const tokenParts = token.split('.');
  if (tokenParts.length < 2) return false;
  const header = atob(tokenParts[0]);
  return (
    !!header &&
    Object.keys(JSON.parse(header)).every(
      (key) => ['alg', 'enc', 'kid'].includes(key) // CAUTION! Implementation details from Auth.js. Can be changed in the future
    )
  );
};

export const decodeToken = (jwt: string) =>
  decodeJWT({
    token: jwt,
    salt: SESSION_COOKIE_NAME,
    secret: process.env.AUTH_SECRET!,
  });
