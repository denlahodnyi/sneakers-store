import type { DiscountType, OrderCreateDto } from '@sneakers-store/contracts';
import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { getServerClient, stripe, type Stripe } from '~/shared/api';
import { env } from '~/shared/config';

const { STRIPE_WEBHOOK_SECRET } = env;

const client = getServerClient();

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    // Verify that the request came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      signature!,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return NextResponse.json({
      error: `Webhook Error: ${err instanceof Error ? err.message : ''}`,
    });
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const {
        data: { object: session },
      } = event;
      const items: OrderCreateDto['items'] = [];

      for await (const li of stripe.checkout.sessions.listLineItems(
        session.id,
        {
          expand: ['data.price.product'],
        },
      )) {
        const { metadata } = li.price?.product as Stripe.Product;
        items.push({
          productSkuId: metadata.productSkuId,
          priceInCents: Number(metadata.priceInCents),
          discount:
            metadata.discountType && metadata.discountValue
              ? {
                  discountType: metadata.discountType as DiscountType,
                  discountValue: Number(metadata.discountValue),
                }
              : null,
          finalPriceInCents: li.amount_total,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          qty: li.quantity!,
        });
      }
      const customerDetails = session.customer_details;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const totalPriceInCents = session.amount_total!;
      const priceInCents = Number(session.metadata?.priceInCents);
      const totalDiscountInCents =
        Number(session.metadata?.totalDiscountInCents) || null;
      const userId = session.metadata?.userId || null;
      const customerName = session.metadata?.customerName;
      const email = session.metadata?.customerEmail;
      const phone = session.metadata?.customerPhone;
      const address = {
        line1: customerDetails?.address?.line1 || '',
        line2: customerDetails?.address?.line2 || '',
        country: customerDetails?.address?.country || '',
        state: customerDetails?.address?.state || '',
        city: customerDetails?.address?.city || '',
        postalCode: customerDetails?.address?.postal_code || '',
      };
      // TODO: maybe we need some data validation here

      const res = await client.order.createOrder({
        body: {
          address,
          customerName,
          email,
          items,
          payStatus: 'paid',
          phone,
          priceInCents,
          totalDiscountInCents,
          totalPriceInCents,
          userId,
        },
      });
      if (res.body.status === 'error') {
        console.error('Order creation error', res.body);
      }

      if (res.body.status === 'success' && session.metadata?.cartId) {
        await client.cart.deleteAllCartItems({
          params: { cartId: session.metadata?.cartId },
        });
      }

      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  return NextResponse.json({ received: true });
}
