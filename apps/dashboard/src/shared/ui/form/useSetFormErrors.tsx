import type { inferDtoErrors } from '@sneakers-store/contracts';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useSetFormErrors<T extends inferDtoErrors<any>>(
  state: { success?: boolean; errors?: T },
  setError: UseFormReturn['setError'],
) {
  useEffect(() => {
    if (!state?.success && state?.errors) {
      (
        Object.entries(state.errors) as [keyof typeof state.errors, string[]][]
      ).forEach(([key, messages]) => {
        if (Array.isArray(messages)) {
          setError(key as string, {
            type: 'custom',
            message: messages[0],
          });
        }
      });
    }
  }, [setError, state]);
}
