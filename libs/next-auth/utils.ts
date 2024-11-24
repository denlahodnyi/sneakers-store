import type {
  SessionResponseDto,
  UserResponseDto,
} from '@sneakers-store/contracts';
import type { AdapterSession, AdapterUser } from 'next-auth/adapters';

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
