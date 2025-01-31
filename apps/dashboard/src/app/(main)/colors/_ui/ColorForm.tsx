'use client';

import {
  Button,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  TextField,
} from '@mui/material';
import {
  useForm,
  Controller,
  type SubmitHandler,
  useFieldArray,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColorResponseDto } from '@sneakers-store/contracts';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import { Delete } from '@mui/icons-material';

import { colorSchema, type ColorSchema } from '~/entities/color';
import { createColor } from '../_api/color.server-fn';

type ColorFormProps = {
  defaultValues?: ColorResponseDto;
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function ColorForm({ id, defaultValues, actionType }: ColorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createColor, undefined);
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    setError,
  } = useForm({
    resolver: zodResolver(colorSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          hexes: defaultValues.hex.map((v) => ({ hex: v })),
        }
      : {
          name: '',
          hexes: [{ hex: '#000000' }],
          isActive: false,
        },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'hexes' });

  const onSubmit: SubmitHandler<ColorSchema> = (data) => {
    const dupFreeHexes: string[] = [];
    data.hexes
      .map((o) => o.hex)
      .forEach((hex) => {
        if (!dupFreeHexes.includes(hex)) dupFreeHexes.push(hex);
      });
    const hexes = dupFreeHexes.map((hex) => ({ hex }));
    startTransition(() => {
      action(
        actionType === 'edit'
          ? { ...data, hexes, _action: 'edit', id: Number(id) }
          : { ...data, hexes, _action: 'create' },
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
        {fields.map((item, index) => (
          <Controller
            key={item.id}
            control={control}
            name={`hexes.${index}.hex`}
            render={({ field, fieldState }) => (
              <div className="flex items-center space-x-3">
                <TextField
                  required
                  label={`Hex #${index + 1}`}
                  placeholder="#000000"
                  type="color"
                  {...field}
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  sx={{ width: '100%' }}
                />
                <IconButton onClick={() => remove(index)}>
                  <Delete />
                </IconButton>
              </div>
            )}
          />
        ))}
        <Button onClick={() => append({ hex: '#000000' })}>Add hex</Button>
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
