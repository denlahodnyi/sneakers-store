'use client';

import {
  useActionState,
  useOptimistic,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { toggleLike } from '../api/toggle-like';

export default function LikeProductForm({
  defaultState,
  productVarId,
  children,
  onSuccess,
  ...props
}: {
  defaultState: boolean;
  productVarId: string;
  children: (isLiked: boolean, pending: boolean) => ReactNode;
  onSuccess?: (isLiked: boolean) => void;
} & Omit<ComponentProps<'form'>, 'children'>) {
  const [isLiked, setIsLiked] = useState(defaultState);
  const [optimisticState, addOptimistic] = useOptimistic<boolean, boolean>(
    isLiked,
    (_, optimisticVal) => optimisticVal,
  );
  const [, action, pending] = useActionState(async () => {
    addOptimistic(!isLiked);
    const result = await toggleLike(productVarId, !isLiked);
    if (result.success) {
      setIsLiked(!isLiked);
      if (onSuccess) onSuccess(!isLiked);
    }
    return result;
  }, undefined);

  return (
    <form action={action} {...props}>
      {children(optimisticState, pending)}
    </form>
  );
}
