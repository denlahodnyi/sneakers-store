import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getServerClient } from '~/shared/api';

const client = getServerClient({ isRSC: true });

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const cookieStore = await cookies();
  const res = await client.order.getUserOrder({
    extraHeaders: { Cookie: cookieStore.toString() },
    params: { orderId },
  });
  const order = res.body.status === 'success' ? res.body.data.order : null;

  if (!order) notFound();

  return (
    <div className="flex-1 sm:px-4">
      <h1 className="mb-4 text-3xl">Order details</h1>
      <div className="max-w-[600px] divide-y">
        <div className="grid grid-cols-[1fr_auto] gap-y-1 py-3">
          <div className="text-zinc-500">Ordered at</div>
          <div className="text-right">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
          <div className="text-zinc-500">Status</div>
          <div className="text-right capitalize">{order.payStatus}</div>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-y-1 py-3">
          <div className="text-zinc-500">Customer name</div>
          <div className="text-right">{order.customerName}</div>
          <div className="text-zinc-500">Email</div>
          <div className="text-right">{order.email}</div>
          <div className="text-zinc-500">Phone</div>
          <div className="text-right">{order.phone}</div>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-y-1 py-3">
          <div className="text-zinc-500">Total</div>
          <div className="text-xl">{order.formattedTotalPrice}</div>
          <div className="text-zinc-500">Discount</div>
          <div>{order.formattedTotalDiscount}</div>
        </div>
        {order.items.map((it) => (
          <Link
            key={it.id}
            className="grid grid-cols-[auto_1fr_auto] gap-2 py-2"
            href={`/store/product/${it.productVariantId}`}
          >
            <div className="relative size-[100px] rounded-md">
              <Image
                fill
                alt={it.image?.alt || ''}
                className="rounded-[inherit] object-cover"
                sizes="33vw"
                src={it.image?.url || '/placeholder_2_1080x1080.webp'}
              />
            </div>
            <div>
              <p className="text-xl font-bold">{it.productName}</p>
              <p className="text-zinc-500">{it.brand?.name}</p>
              <p className="text-zinc-500">{it.color.name}</p>
              <p className="text-zinc-500">{`${it.category?.name} (${it.gender})`}</p>
            </div>
            <div>
              {!it.formattedDiscount ? (
                <p>{it.formattedFinalPrice}</p>
              ) : (
                <>
                  <p className="text-sm">
                    <span className="line-through">{it.formattedPrice}</span>{' '}
                    <span className="text-destructive">
                      {it.formattedDiscount}
                    </span>
                  </p>
                  <p>{it.formattedFinalPrice}</p>
                </>
              )}
              <p>{`x${it.qty}`}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
