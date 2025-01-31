'use client';

import {
  Button,
  CircularProgress,
  FormGroup,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  useForm,
  Controller,
  type SubmitHandler,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type ProductVariantResponseDto,
  type ColorResponseDto,
  type ProductResponseDto,
} from '@sneakers-store/contracts';
import {
  startTransition,
  useActionState,
  useRef,
  useState,
  useTransition,
} from 'react';

import {
  productVarScheme,
  type ProductVarScheme,
} from '~/entities/product-variant';
import { getConicGradientFromHexes } from '~/shared/ui/styles';
import { createProductVariant } from '../_api/product-var.server-fn';
import NewProductImgUploader from './NewProductImgUploader';
import { getProducts } from '../../products/_api/product-server-fn';

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
  const [productsList, setProductsList] = useState(products);
  const [productsPage, setProductsPage] = useState(1);
  const [canFetchMoreProducts, setCanFetchMoreProducts] = useState(true);
  const [productsPending, startProductsTransition] = useTransition();
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    setValue,
  } = useForm({
    resolver: zodResolver(productVarScheme),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          productId: defaultValues.productId || '',
          colorId:
            defaultValues.colorId ||
            ('' as unknown as ProductVarScheme['colorId']),
          name: defaultValues.name || '',
          slug: defaultValues.slug || '',
          images: [] as unknown as Omit<
            ProductVariantResponseDto['images'][number],
            'id' | 'productVarId'
          >[],
        }
      : {
          productId: '',
          colorId: '' as unknown as ProductVarScheme['colorId'],
          name: '',
          slug: '',
          images: [] as unknown as Omit<
            ProductVariantResponseDto['images'][number],
            'id' | 'productVarId'
          >[],
        },
  });

  const selectedProductId = useWatch({ control, name: 'productId' });
  const selectedColorId = useWatch({ control, name: 'colorId' });
  const name = useWatch({ control, name: 'name' });

  const onSubmit: SubmitHandler<ProductVarScheme> = (data) => {
    startTransition(() => {
      action(
        actionType === 'edit'
          ? { ...data, _action: 'edit', id }
          : { ...data, _action: 'create' },
      );
    });
  };

  const generateSlug = () => {
    if (name) {
      let slug = '';
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replaceAll(' ', '-');
      setValue('slug', slug);
    }
  };

  const generateName = () => {
    if (selectedProductId && selectedColorId) {
      let name = '';
      const prodName = products.find((o) => o.id === selectedProductId)?.name;
      const colorName = colors.find((o) => o.id === selectedColorId)?.name;

      if (prodName && colorName) {
        name = prodName + ' ' + colorName;
      }

      setValue('name', name);
    }
  };

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
              label="Product ID"
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
                      style={{
                        backgroundImage: getConicGradientFromHexes(option.hex),
                      }}
                    />
                    {option.name}
                  </span>
                </MenuItem>
              ))}
            </TextField>
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
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        disabled={!selectedProductId && !selectedColorId}
                        onClick={generateName}
                      >
                        Generate
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
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
                      <Button disabled={!name} onClick={generateSlug}>
                        Generate
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
        <div>
          {!id && (
            <NewProductImgUploader
              onChange={(uploadedImages) => {
                setValue(
                  'images',
                  uploadedImages.map((img) => ({
                    publicId: img.public_id,
                    url: img.url,
                    width: img.width,
                    height: img.height,
                    alt: '',
                  })),
                );
              }}
            />
          )}
        </div>
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
