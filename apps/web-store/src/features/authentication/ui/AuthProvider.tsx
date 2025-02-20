'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';

import type { Session } from '~/shared/api';

type AuthContextValue = Session | null;

export const AuthContext = createContext<AuthContextValue>(null);

export function AuthProvider({
  children,
  value,
}: PropsWithChildren & { value: AuthContextValue }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (typeof ctx === 'undefined')
    throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
