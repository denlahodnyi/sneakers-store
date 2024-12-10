'use client';

import {
  Button,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SizeResponseDto, SizeSystem } from '@sneakers-store/contracts';
import { startTransition, useActionState, useRef } from 'react';

import { createSize } from '../_api/size-server-fn';

const schema = z.object({
  size: z
    .string()
    .pipe(z.preprocess((v) => parseFloat(v as string), z.number().positive())),
  system: z
    .literal('')
    .or(z.enum(Object.values(SizeSystem) as [string, ...string[]]))
    .nullable()
    .optional(),
  isActive: z.boolean(),
});

type SizeFormProps = {
  defaultValues?: SizeResponseDto;
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function SizeForm({ id, defaultValues, actionType }: SizeFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, action, pending] = useActionState(createSize, undefined);
  const { control, formState, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? { ...defaultValues, system: defaultValues.system ?? '' }
      : {
          name: '',
          size: '',
          system: '',
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
          name="size"
          // rules={{ min: 0 }}
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
