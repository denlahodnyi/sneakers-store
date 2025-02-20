import { cookies } from 'next/headers';

import { auth, getServerClient } from '~/shared/api';
import { ContentContainer } from '~/shared/ui';
import {
  CheckoutCart,
  CheckoutCartDataRefresh,
  CheckoutCustomer,
  CheckoutItemsCount,
  CheckoutPriceSummary,
} from './_ui';

const client = getServerClient({ isRSC: true });

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const { user } = (await auth()) || {};
  const response = await client.cart.getUserCart({
    extraHeaders: { Cookie: cookieStore.toString() },
  });
  const userCart =
    response.body.status === 'success' ? response.body.data.cart : undefined;

  return (
    <ContentContainer className="w-full flex-1 bg-background">
      <CheckoutCartDataRefresh
        isAuthed={Boolean(user?.id)}
        userCart={userCart}
      />
      <h1 className="mb-6 text-4xl">Summary order</h1>
      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl">
            Your product list{' '}
            <span className="text-zinc-500">
              (<CheckoutItemsCount /> items)
            </span>
          </h2>
          <CheckoutCart />
          <h2 className="mb-4 mt-4 text-2xl">Your contact information</h2>
          <CheckoutCustomer />
        </div>
        <div>
          <h2 className="mb-4 text-2xl">Pricing details</h2>
          <CheckoutPriceSummary />
        </div>
      </div>
    </ContentContainer>
  );
}
