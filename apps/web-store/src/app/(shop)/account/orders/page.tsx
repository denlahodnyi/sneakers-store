import { cookies } from 'next/headers';
import Link from 'next/link';

import { getServerClient } from '~/shared/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/shared/ui';

const client = getServerClient({ isRSC: true });

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) || 1 : 1;
  const { body } = await client.order.getUserOrders({
    extraHeaders: { Cookie: cookieStore.toString() },
    query: { page, perPage: 10 },
  });
  const { orders, pagination } =
    body.status === 'success' ? body.data : { orders: [], pagination: null };

  return (
    <div className="flex-1 sm:px-4">
      <h1 className="mb-4 text-3xl">Orders</h1>
      <div className="mb-5 grid max-w-[400px] grid-cols-3 divide-y">
        {orders.map((o) => (
          <Link
            key={o.id}
            className="col-span-3 grid grid-cols-subgrid py-2 hover:bg-muted"
            href={`/account/orders/${o.id}`}
          >
            <div>{new Date(o.createdAt).toLocaleDateString()}</div>
            <div className="capitalize">{o.payStatus}</div>
            <div className="text-right">{o.formattedTotalPrice}</div>
          </Link>
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <Pagination className="justify-start">
          <PaginationContent>
            {pagination.prev && (
              <PaginationItem>
                <PaginationPrevious
                  href={`/account/orders?page=${pagination.prev}`}
                />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href="#">{pagination.current}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            {pagination.next && (
              <PaginationItem>
                <PaginationNext
                  href={`/account/orders?page=${pagination.next}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
