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
import type { CategoryResponseDto } from '@sneakers-store/contracts';
import { startTransition, useActionState, useEffect, useRef } from 'react';

import { categorySchema, type CategorySchema } from '~/entities/category';
import { createCategory } from '../_api/category-server-fn';

type CategoryFormProps = {
  defaultValues?: CategoryResponseDto;
  categories: CategoryResponseDto[];
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function CategoryForm({
  id,
  defaultValues,
  actionType,
  categories,
}: CategoryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createCategory, undefined);
  const { control, formState, handleSubmit, setError } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          parentId:
            defaultValues.parentId ||
            ('' as unknown as CategorySchema['parentId']),
        }
      : {
          name: '',
          slug: '',
          isActive: false,
          parentId: '' as unknown as CategorySchema['parentId'],
        },
  });
  const { isDirty } = formState;

  const onSubmit: SubmitHandler<CategorySchema> = (data) => {
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
          name="slug"
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Slug"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="parentId"
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Parent ID"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {categories.map((option) => (
                <MenuItem
                  key={option.id}
                  disabled={option.id === Number(id)}
                  value={option.id}
                >
                  {option.name}
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

export default CategoryForm;
