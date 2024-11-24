import type { PropsWithChildren } from 'react';

import { signOut } from '~/shared/api';
import TopBar from './TopBar';

function MainLayout({ children }: PropsWithChildren) {
  const logoutServerFn = async () => {
    'use server';
    return signOut({ redirectTo: '/login' });
  };

  return (
    <div className="min-h-screen" data-layout="main">
      <TopBar logoutServerFn={logoutServerFn} />
      {children}
    </div>
  );
}

export default MainLayout;
