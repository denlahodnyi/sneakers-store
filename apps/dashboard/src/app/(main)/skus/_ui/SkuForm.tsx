'use client';

import {
  Button,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  // InputAdornment,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import {
  useForm,
  Controller,
  type SubmitHandler,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  FullProductSkuResponseDto,
  PreviewProductResponseDto,
  ProductVariantResponseDto,
  SizeResponseDto,
} from '@sneakers-store/contracts';
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { NumericFormat } from 'react-number-format';

import { getClientSideClient } from '~/shared/api/client-only';
import { skuSchema, type SkuSchema } from '~/entities/sku';
import { createProductSku } from '../_api/sku-server-fn';
import { getProducts } from '../../products/_api/product-server-fn';

const client = getClientSideClient();

type SkuFormProps = {
  defaultValues?: Partial<FullProductSkuResponseDto>;
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
  const [productsList, setProductsList] = useState(products);
  const [productsPage, setProductsPage] = useState(1);
  const [canFetchMoreProducts, setCanFetchMoreProducts] = useState(true);
  const [productsPending, startProductsTransition] = useTransition();
  const {
    control,
    formState,
    handleSubmit,
    setError /* getValues, setValue */,
  } = useForm({
    resolver: zodResolver(skuSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          productId: defaultValues.productId || '',
          productVarId: defaultValues.productVarId || '',
          sizeId:
            defaultValues.sizeId || ('' as unknown as SkuSchema['sizeId']),
          sku: defaultValues.sku || '',
          // name: defaultValues.name || '',
          // slug: defaultValues.slug || '',
          stockQty: defaultValues.stockQty || 0,
          basePrice: defaultValues.price || 0, // Will be transformed using minor units in api handler
          isActive: defaultValues.isActive || false,
        }
      : {
          productId: '',
          productVarId: '',
          sizeId: '' as unknown as SkuSchema['sizeId'],
          sku: '',
          // name: '',
          // slug: '',
          stockQty: 0,
          basePrice: 0,
          isActive: false,
        },
  });
  const { isDirty } = formState;
  const selectedProductId = useWatch({ control, name: 'productId' });
  const [variants, setVariants] = useState<ProductVariantResponseDto[]>([]);

  const onSubmit: SubmitHandler<SkuSchema> = (data) => {
    startTransition(() => {
      action(
        actionType === 'edit'
          ? { ...data, _action: 'edit', id }
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

  useEffect(() => {
    if (selectedProductId) {
      async function getVariants() {
        const { body } = await client.productVariants.getProductVariants({
          query: { productId: selectedProductId, fields: 'color' },
        });
        if (body.status === 'success') {
          setVariants(body.data.productVariants);
        } else {
          console.error(body.message);
        }
      }
      getVariants();
    }
  }, [selectedProductId]);

  // const generateSlug = () => {
  //   if (selectedProductId) {
  //     let slug = '';
  //     const prodName = products.find((o) => o.id === selectedProductId)?.name;
  //     const skuName = getValues('name');

  //     if (prodName) {
  //       slug = prodName
  //         .toLowerCase()
  //         .replace(/[^a-z0-9\s]/g, '')
  //         .trim()
  //         .replaceAll(' ', '-');
  //     }
  //     if (skuName) {
  //       slug +=
  //         '-' +
  //         skuName
  //           .toLowerCase()
  //           .replace(/[^a-z0-9\s]/g, '')
  //           .trim()
  //           .replaceAll(' ', '-');
  //     }
  //     setValue('slug', slug);
  //   }
  // };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
              {productsList.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
              <div className="text-center">
                {canFetchMoreProducts && (
                  <Button
                    disabled={productsPending}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      startProductsTransition(async () => {
                        const { products: fetchedProducts, pagination } =
                          await getProducts({
                            page: productsPage + 1,
                            priorIds: defaultValues?.productId,
                          });
                        setProductsList((prev) => [
                          ...prev,
                          ...fetchedProducts,
                        ]);
                        setProductsPage(pagination.current);
                        setCanFetchMoreProducts(!!pagination.next);
                      });
                    }}
                  >
                    {productsPending && (
                      <CircularProgress color="inherit" size="18px" />
                    )}
                    Load more
                  </Button>
                )}
              </div>
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
        {/* <Controller
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
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        disabled={!selectedProductId}
                        onClick={generateSlug}
                      >
                        Generate
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        /> */}
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
            <NumericFormat
              required
              thousandSeparator
              valueIsNumericString
              allowNegative={false}
              customInput={TextField}
              decimalScale={2}
              label="Base price"
              prefix="$"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
              onChange={undefined}
              onValueChange={(values) => field.onChange(values.value)}
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
