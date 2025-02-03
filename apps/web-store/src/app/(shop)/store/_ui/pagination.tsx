'use client';
import type { Contract } from '@sneakers-store/contracts';
import type { ClientInferResponseBody } from '@ts-rest/core';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/shared/ui';

export function CatalogPagination({
  pagination,
}: {
  pagination: ClientInferResponseBody<
    Contract['catalog']['getProducts']
  >['data']['pagination'];
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      params.set(name, value);

      return params.toString();
    },
    [sp],
  );

  const prevLink = pagination.prev
    ? `${pathname}?${createQueryString('page', pagination.prev.toString())}`
    : '';
  const nextLink = pagination.next
    ? `${pathname}?${createQueryString('page', pagination.next.toString())}`
    : '';

  return (
    <Pagination>
      <PaginationContent>
        {!!pagination.prev && (
          <>
            <PaginationItem>
              <PaginationPrevious href={prevLink} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={prevLink}>{pagination.prev}</PaginationLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <PaginationLink isActive href="#">
            {pagination.current}
          </PaginationLink>
        </PaginationItem>
        {!!pagination.next && (
          <>
            <PaginationItem>
              <PaginationLink href={nextLink}>{pagination.next}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href={nextLink} />
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}
