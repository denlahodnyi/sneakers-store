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
import {
  Gender,
  type BrandResponseDto,
  type CategoryResponseDto,
  type ProductResponseDto,
} from '@sneakers-store/contracts';
import { startTransition, useActionState, useRef } from 'react';

import { createProduct } from '../_api/product-server-fn';

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(255).nullable().optional(),
  gender: z.enum(Object.values(Gender) as [string, ...string[]]),
  brandId: z.string().min(1, 'Must be selected'),
  categoryId: z.string().min(1, 'Must be selected'),
  isActive: z.boolean(),
});

type ProductFormProps = {
  defaultValues?: ProductResponseDto;
  categories: CategoryResponseDto[];
  brands: BrandResponseDto[];
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function ProductForm({
  id,
  defaultValues,
  actionType,
  brands,
  categories,
}: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, action, pending] = useActionState(createProduct, undefined);
  const { control, formState, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? { ...defaultValues, description: defaultValues.description || '' }
      : {
          name: '',
          description: '',
          gender: Object.values(Gender)[0],
          brandId: '',
          categoryId: '',
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
          name="categoryId"
          render={({ field, fieldState }) => (
            <TextField
              required
              select
              label="Category"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {categories.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="brandId"
          render={({ field, fieldState }) => (
            <TextField
              required
              select
              label="Brand"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {brands.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="gender"
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Gender"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {Object.values(Gender).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              multiline
              label="Description"
              minRows={10}
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

export default ProductForm;
