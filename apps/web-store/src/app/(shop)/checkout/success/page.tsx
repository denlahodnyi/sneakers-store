import { CircleCheckIcon } from 'lucide-react';
import Link from 'next/link';

import { auth, stripe } from '~/shared/api';
import { Button, ContentContainer } from '~/shared/ui';
import ClearCartOnSuccess from './_ui/ClearCartOnSuccess';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SuccessCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const session = await auth();
  let customerName = '';
  let isRealSession = false;

  if (sp.session_id) {
    const session = await stripe.checkout.sessions.retrieve(
      sp.session_id as string,
    );
    isRealSession = !!session.id;
    if (session.metadata?.customerName) {
      customerName = session.metadata.customerName;
    }
  }
  return (
    <ContentContainer className="grid flex-1 auto-rows-min content-center justify-items-center text-center">
      {isRealSession && <ClearCartOnSuccess />}
      <CircleCheckIcon className="mb-8 inline size-[60px] text-success" />
      <h1 className="mb-9 max-w-[400px] text-4xl">
        Thank you <span className="text-tertiary">{customerName}</span> for your
        order!
      </h1>
      {!!session?.user?.id && (
        <Button asChild variant="outline">
          <Link href="/account/orders">My orders</Link>
        </Button>
      )}
    </ContentContainer>
  );
}
