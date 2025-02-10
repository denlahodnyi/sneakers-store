import type { PropsWithChildren } from 'react';
import { cookies } from 'next/headers';

import { AuthProvider } from '~/features/authentication';
import { auth, getServerClient } from '~/shared/api';
import { CartProvider } from '~/features/cart';
import { MainFooter, MainHeader } from './_ui';

const client = getServerClient({ isRSC: true });

async function ShopLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const session = await auth();
  const savedUserCartRes = session?.user?.id
    ? await client.cart.getUserCart({
        extraHeaders: { Cookie: cookieStore.toString() },
      })
    : undefined;
  const savedUserCart =
    savedUserCartRes?.body.status === 'success'
      ? savedUserCartRes.body.data.cart
      : undefined;

  return (
    <AuthProvider value={session}>
      <CartProvider user={session?.user} userCart={savedUserCart}>
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
      </CartProvider>
    </AuthProvider>
  );
}

export default ShopLayout;
