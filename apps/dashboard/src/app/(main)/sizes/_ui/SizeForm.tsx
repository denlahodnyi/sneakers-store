'use client';

import {
  Button,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SizeResponseDto, SizeSystem } from '@sneakers-store/contracts';
import { startTransition, useActionState, useEffect, useRef } from 'react';

import { sizeSchema, type SizeSchema } from '~/entities/size';
import { createSize } from '../_api/size-server-fn';

type SizeFormProps = {
  defaultValues?: SizeResponseDto;
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function SizeForm({ id, defaultValues, actionType }: SizeFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createSize, undefined);
  const { control, formState, handleSubmit, setError } = useForm({
    resolver: zodResolver(sizeSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          size: defaultValues.size as unknown as SizeSchema['size'],
          system:
            defaultValues.system ?? ('' as unknown as SizeSchema['system']),
        }
      : {
          name: '',
          size: '' as unknown as SizeSchema['size'],
          system: '' as unknown as SizeSchema['system'],
          isActive: false,
        },
  });
  const { isDirty } = formState;

  const onSubmit: SubmitHandler<SizeSchema> = (data) => {
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
          name="size"
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Size"
              type="number"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="system"
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Size system"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {Object.values(SizeSystem).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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

export default SizeForm;
