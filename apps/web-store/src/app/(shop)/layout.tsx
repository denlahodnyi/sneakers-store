import type { PropsWithChildren } from 'react';

import { AuthProvider } from '~/features/authentication';
import { auth } from '~/shared/api';
import { MainFooter, MainHeader } from './_ui';

async function ShopLayout({ children }: PropsWithChildren) {
  const session = await auth();
  return (
    <AuthProvider value={session}>
      <div
        className="flex min-h-screen flex-col"
        style={{
          backgroundAttachment: 'fixed',
          backgroundImage:
            'repeating-radial-gradient( circle at 0 0, transparent 0, #ffffff 8px ), repeating-linear-gradient( #9d9d9d00, #9d9d9d00 )',
        }}
      >
        <MainHeader user={session?.user} />
        {children}
        <MainFooter />
      </div>
    </AuthProvider>
  );
}

export default ShopLayout;
