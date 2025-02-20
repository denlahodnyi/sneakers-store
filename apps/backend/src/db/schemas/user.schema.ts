import { Role } from '@sneakers-store/contracts';
import type { InferSelectModel } from 'drizzle-orm';
import * as t from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

import { timestamps } from './columns.utils.js';

export type UserEntity = InferSelectModel<typeof usersTable>;
export type SessionEntity = InferSelectModel<typeof sessionsTable>;

export const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.ADMIN];

export const rolesEnum = t.pgEnum('role', [Role.SUPER_ADMIN, Role.ADMIN]);

export const usersTable = t.pgTable('users', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: t.text(),
  email: t.text().unique(),
  emailVerified: t.timestamp({ mode: 'string' }),
  image: t.text(),
  password: t.varchar({ length: 255 }),
  role: rolesEnum(),
  phone: t.varchar({ length: 20 }),
  ...timestamps,
});

export const accountsTable = t.pgTable(
  'accounts',
  {
    userId: t
      .text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: t.text().$type<AdapterAccountType>().notNull(),
    provider: t.text().notNull(),
    providerAccountId: t.text().notNull(),
    refresh_token: t.text(),
    access_token: t.text(),
    expires_at: t.integer(),
    token_type: t.text(),
    scope: t.text(),
    id_token: t.text(),
    session_state: t.text(),
    ...timestamps,
  },
  (account) => [
    t.primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessionsTable = t.pgTable('sessions', {
  sessionToken: t.text().primaryKey(),
  userId: t
    .text()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  expires: t.timestamp({ mode: 'string' }).notNull(),
});

// export const verificationTokens = pgTable(
//   'verificationTokens',
//   {
//     identifier: t.text('identifier').notNull(),
//     token: t.text('token').notNull(),
//     expires: t.timestamp('expires', { mode: 'date' }).notNull(),
//   },
//   (verificationToken) => ({
//     compositePk: t.primaryKey({
//       columns: [verificationToken.identifier, verificationToken.token],
//     }),
//   }),
// );

// export const authenticators = pgTable(
//   'authenticators',
//   {
//     credentialID: t.text('credentialID').notNull().unique(),
//     userId: t
//       .text('userId')
//       .notNull()
//       .references(() => users.id, { onDelete: 'cascade' }),
//     providerAccountId: t.text('providerAccountId').notNull(),
//     credentialPublicKey: t.text('credentialPublicKey').notNull(),
//     counter: t.integer('counter').notNull(),
//     credentialDeviceType: t.text('credentialDeviceType').notNull(),
//     credentialBackedUp: t.boolean('credentialBackedUp').notNull(),
//     transports: t.text('transports'),
//   },
//   (authenticator) => [
//     t.primaryKey({
//       columns: [authenticator.userId, authenticator.credentialID],
//     }),
//   ],
// );
