import type { PropsWithChildren } from 'react';

import { AuthProvider } from '~/features/authentication';
import { auth } from '~/shared/api';
import { MainFooter, MainHeader } from './_ui';

async function ShopLayout({ children }: PropsWithChildren) {
  const session = await auth();
  return (
    <AuthProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <MainHeader user={session?.user} />
        {children}
        <MainFooter />
      </div>
    </AuthProvider>
  );
}

export default ShopLayout;
