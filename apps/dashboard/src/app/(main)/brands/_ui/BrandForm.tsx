'use client';

import {
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
} from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BrandResponseDto } from '@sneakers-store/contracts';
import { startTransition, useActionState, useEffect, useRef } from 'react';

import { brandSchema, type BrandSchema } from '~/entities/brand';
import { createBrand } from '../_api/brand-server-fn';

type BrandFormProps = {
  defaultValues?: BrandResponseDto;
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function BrandForm({ id, defaultValues, actionType }: BrandFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createBrand, undefined);
  const { control, formState, handleSubmit, setError } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: defaultValues
      ? { ...defaultValues, iconUrl: defaultValues.iconUrl ?? '' }
      : {
          name: '',
          isActive: false,
          iconUrl: '',
        },
  });
  const { isDirty } = formState;

  const onSubmit: SubmitHandler<BrandSchema> = (data) => {
    startTransition(() => {
      action(
        actionType === 'edit'
          ? { ...data, _action: 'edit', id: Number(id) }
          : { ...data, _action: 'create' },
      );
    });
  };

  useEffect(() => {
    if (!state?.success && state?.errors) {
      (
        Object.entries(state.errors) as [keyof typeof state.errors, string[]][]
      ).forEach(([key, messages]) => {
        if (Array.isArray(messages)) {
          setError(key, {
            type: 'custom',
            message: messages[0],
          });
        }
      });
    }
  }, [setError, state]);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <FormGroup sx={{ gap: 5, maxWidth: '480px' }}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Name"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="iconUrl"
          render={({ field, fieldState }) => (
            <TextField
              label="Icon URL"
              type="url"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="Is active?"
            />
          )}
        />
      </FormGroup>
      <Button
        disabled={!isDirty || pending}
        size="large"
        sx={{ mt: 5 }}
        type="submit"
        variant="contained"
      >
        Save
      </Button>
    </form>
  );
}

export default BrandForm;
