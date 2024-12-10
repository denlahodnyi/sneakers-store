'use client';

import { Button, FormGroup, MenuItem, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type ProductVariantResponseDto,
  type ColorResponseDto,
  type ProductResponseDto,
} from '@sneakers-store/contracts';
import { startTransition, useActionState, useRef } from 'react';

import { createProductVariant } from '../_api/product-var-server-fn';

const schema = z.object({
  productId: z.string().uuid(),
  colorId: z.string().uuid(),
  previewImg: z.string().nullable().optional(),
  thumbnailImg: z.string().nullable().optional(),
  smallImg: z.string().nullable().optional(),
  largeImg: z.string().nullable().optional(),
});

type ProductVariantFormProps = {
  defaultValues?: Partial<ProductVariantResponseDto>;
  products: ProductResponseDto[];
  colors: ColorResponseDto[];
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function ProductVariantForm({
  id,
  defaultValues,
  actionType,
  colors,
  products,
}: ProductVariantFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, action, pending] = useActionState(createProductVariant, undefined);
  const { control, formState, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          productId: defaultValues.productId || '',
          colorId: defaultValues.colorId || '',
          previewImg: defaultValues.previewImg || '',
          thumbnailImg: defaultValues.thumbnailImg || '',
          smallImg: defaultValues.smallImg || '',
          largeImg: defaultValues.largeImg || '',
        }
      : {
          productId: '',
          colorId: '',
          previewImg: '',
          thumbnailImg: '',
          smallImg: '',
          largeImg: '',
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
          name="productId"
          render={({ field, fieldState }) => (
            <TextField
              required
              select
              label="Product ID"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {products.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="colorId"
          render={({ field, fieldState }) => (
            <TextField
              required
              select
              label="Color ID"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem sx={{ pl: 10 }} value="">
                N/A
              </MenuItem>
              {colors.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <span className="flex items-center">
                    <span
                      className="border-1 -mt-[1px] mr-2 inline-block h-4 w-4 rounded-full border-solid border-slate-700"
                      style={{ backgroundColor: option.hex }}
                    />
                    {option.name}
                  </span>
                </MenuItem>
              ))}
            </TextField>
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

export default ProductVariantForm;
