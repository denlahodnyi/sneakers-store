import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { stripe, Stripe } from '~/shared/api';

type LineItems = Stripe.Checkout.SessionCreateParams.LineItem[];

const payloadScheme = z.object({
  userId: z.string().uuid().nullable(),
  customerData: z.object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    phone: z.string().trim().min(1),
  }),
  cart: z.object({
    id: z.string().uuid().nullable(),
    priceInCents: z.number().int().gt(0),
    totalPriceInCents: z.number().int().gt(0),
    totalDiscountInCents: z.number().int().gt(0).nullable(),
    items: z
      .array(
        z.object({
          productSkuId: z.string().uuid(),
          name: z.string().trim().min(1),
          priceInCents: z.number().int().gt(0),
          finalPriceInCents: z.number().int().gt(0),
          qty: z.number().int().gt(0),
          discountType: z.string().nullable(),
          discountValue: z.number().int().gt(0).nullable(),
        }),
      )
      .nonempty(),
  }),
});

export async function POST(req: NextRequest) {
  // TODO: check products availability
  try {
    const headersList = await headers();
    const origin = headersList.get('origin');
    const body = await req.json();
    const bodyParseRes = payloadScheme.safeParse(body);

    if (!bodyParseRes.success) {
      console.error(bodyParseRes.error.format());
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const lineItems: LineItems = bodyParseRes.data.cart.items.map((it) => ({
      quantity: it.qty,
      price_data: {
        currency: 'usd',
        unit_amount: it.finalPriceInCents,
        product_data: {
          name: it.name,
          metadata: {
            productSkuId: it.productSkuId,
            priceInCents: it.priceInCents,
            finalPriceInCents: it.finalPriceInCents,
            discountType: it.discountType,
            discountValue: it.discountValue,
          },
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      billing_address_collection: 'required',
      // shipping_address_collection: {
      //   allowed_countries
      // },
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: bodyParseRes.data.customerData.email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        userId: bodyParseRes.data.userId,
        customerName: bodyParseRes.data.customerData.name,
        customerEmail: bodyParseRes.data.customerData.email,
        customerPhone: bodyParseRes.data.customerData.phone,
        cartId: bodyParseRes.data.cart.id,
        priceInCents: bodyParseRes.data.cart.priceInCents,
        totalPriceInCents: bodyParseRes.data.cart.totalPriceInCents,
        totalDiscountInCents: bodyParseRes.data.cart.totalDiscountInCents,
      },
    });

    if (session.url) {
      return NextResponse.json({ success: true, url: session.url });
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Some error occurred during checkout session creation',
      },
      { status: 500 },
    );
  } catch (err) {
    console.error(err);
    const error =
      err instanceof Stripe.errors.StripeError
        ? err
        : { message: 'Payment has failed', statusCode: 500 };

    return NextResponse.json(
      { success: false, error: error.message },
      { status: error?.statusCode || 500 },
    );
  }
}
