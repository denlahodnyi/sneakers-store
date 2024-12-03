import type { PropsWithChildren } from 'react';
import { Toolbar } from '@mui/material';

import { auth, signOut } from '~/shared/api';
import { TopBar } from './_ui';

async function MainLayout({ children }: PropsWithChildren) {
  const logoutServerFn = async () => {
    'use server';
    return signOut({ redirectTo: '/login' });
  };

  const session = await auth();

  return (
    <div className="flex min-h-screen" data-layout="main">
      <TopBar
        logoutServerFn={logoutServerFn}
        userName={session?.user?.email || ''}
      />
      <main className="grow-[1] overflow-x-hidden">
        {/* Empty Toolbar adds additional height to prevent TopBar overlap  */}
        <Toolbar />
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
