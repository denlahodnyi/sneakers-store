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
import type {
  PreviewProductResponseDto,
  ProductSkuResponseDto,
  ProductVariantResponseDto,
  SizeResponseDto,
} from '@sneakers-store/contracts';
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getClientSideClient } from '~/shared/api/client-only';
import { createProductSku } from '../_api/sku-server-fn';

const client = getClientSideClient();

const schema = z.object({
  productId: z.string().uuid(),
  productVarId: z.string().uuid(),
  sizeId: z.string().uuid().or(z.literal('')).nullable().optional(),
  sku: z.string().min(1).max(50).trim(),
  name: z.string().max(150).trim().or(z.literal('')).nullable().optional(),
  slug: z.string().max(255).trim().or(z.literal('')).nullable().optional(),
  basePrice: z
    .string()
    .pipe(z.preprocess((v) => parseFloat(v as string), z.number().positive())),
  stockQty: z.coerce.number().int().positive(),
  isActive: z.boolean(),
});

type SkuFormProps = {
  defaultValues?: ProductSkuResponseDto;
  products: PreviewProductResponseDto[];
  sizes: SizeResponseDto[];
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function SkuForm({
  id,
  defaultValues,
  actionType,
  products,
  sizes,
}: SkuFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createProductSku, undefined);
  const { control, formState, handleSubmit, getValues, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          sizeId: defaultValues.sizeId || '',
          sku: defaultValues.sku || '',
          name: defaultValues.name || '',
          slug: defaultValues.slug || '',
        }
      : {
          productId: '',
          productVarId: '',
          sizeId: '',
          sku: '',
          name: '',
          slug: '',
          stockQty: 0,
          basePrice: 0,
          isActive: false,
        },
  });
  const { isDirty } = formState;
  const selectedProductId = getValues('productId');
  const [variants, setVariants] = useState<ProductVariantResponseDto[]>([]);

  const onSubmit = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fd = new FormData(formRef.current!);
    startTransition(() => {
      action(fd);
    });
  };

  useEffect(() => {
    if (!state?.success && state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        if (Array.isArray(messages)) {
          setError(key as keyof z.infer<typeof schema>, {
            type: 'custom',
            message: messages[0],
          });
        }
      });
    }
  }, [setError, state]);

  useEffect(() => {
    if (selectedProductId) {
      async function getVariants() {
        const { body } = await client.productVariants.getProductVariants({
          query: { productId: selectedProductId, fields: 'color,test' },
        });
        setVariants(body.data.productVariants);
      }
      getVariants();
    }
  }, [selectedProductId]);

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
              label="Product"
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
          name="productVarId"
          render={({ field, fieldState }) => (
            <TextField
              required
              select
              disabled={!selectedProductId}
              label="Product variant"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {variants.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.color?.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="sizeId"
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Size"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              {sizes.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.size}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="sku"
          render={({ field, fieldState }) => (
            <TextField
              required
              label="SKU"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
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
              label="Slug"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="stockQty"
          rules={{ min: 0 }}
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Quantity"
              type="number"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="basePrice"
          rules={{ min: 0 }}
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Base price (in cents)"
              type="number"
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

export default SkuForm;
