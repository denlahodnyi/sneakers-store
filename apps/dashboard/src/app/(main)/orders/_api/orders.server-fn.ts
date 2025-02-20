'use server';

import type { Contract } from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/orders';

export async function getOrders(
  query?: ClientInferRequest<Contract['order']['getOrders']>['query'],
) {
  const cookie = await cookies();
  const { body } = await client.order.getOrders({
    query: query || null,
    extraHeaders: { Cookie: cookie.toString() },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get orders', { cause: body });
}

export async function getOrder(orderId: string) {
  const cookie = await cookies();
  const { body } = await client.order.getOrder({
    params: { orderId },
    extraHeaders: { Cookie: cookie.toString() },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get order', { cause: body });
}

export async function deleteOrder(orderId: string) {
  const cookie = await cookies();
  const { body } = await client.order.deleteOrder({
    extraHeaders: { Cookie: cookie.toString() },
    params: { orderId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete order', { cause: body });
  }
}

export async function bulkDeleteOrder(ids: string[]) {
  const cookie = await cookies();
  const { body } = await client.order.deleteOrders({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete orders', {
      cause: body,
    });
  }
}
