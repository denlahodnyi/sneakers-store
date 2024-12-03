'use client';

import {
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColorResponseDto } from '@sneakers-store/contracts';
import { startTransition, useActionState, useRef } from 'react';

import { createColor } from '../_api/color-server-fn';

const schema = z.object({
  name: z.string().min(1).trim(),
  isActive: z.boolean(),
  hex: z
    .string()
    .startsWith('#', 'Should start with #')
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    .trim(),
});

type ColorFormProps = {
  defaultValues?: ColorResponseDto;
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function ColorForm({ id, defaultValues, actionType }: ColorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, action, pending] = useActionState(createColor, undefined);
  const { control, formState, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? defaultValues
      : {
          name: '',
          hex: '',
          isActive: false,
        },
  });
  const { isDirty } = formState;

  const onSubmit = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fd = new FormData(formRef.current!);
    startTransition(() => {
      action(fd);
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      {actionType === 'edit' && <input name="id" type="hidden" value={id} />}
      <input name="_action" type="hidden" value={actionType} />
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
          name="hex"
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Hex"
              placeholder="#000 or #000000"
              type="color"
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

export default ColorForm;
