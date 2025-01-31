'use client';

import {
  Button,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Gender,
  type BrandResponseDto,
  type CategoryResponseDto,
  type FullProductResponseDto,
} from '@sneakers-store/contracts';
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { productSchema, type ProductSchema } from '~/entities/product';
import {
  Editor,
  parseStringifiedEditorState,
  stringifyEditorState,
} from '~/shared/ui/rich-text-editor';
import { createProduct } from '../_api/product-server-fn';

type ProductFormProps = {
  defaultValues?: FullProductResponseDto;
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
  const [state, action, pending] = useActionState(createProduct, undefined);

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    setError,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          description: defaultValues.description || '',
          brandId:
            defaultValues.brandId ||
            ('' as unknown as ProductSchema['brandId']),
          categoryId:
            defaultValues.categoryId ||
            ('' as unknown as ProductSchema['categoryId']),
        }
      : {
          name: '',
          description: '',
          gender: Object.values(Gender)[0],
          brandId: '' as unknown as ProductSchema['brandId'],
          categoryId: '' as unknown as ProductSchema['categoryId'],
          isActive: false,
          isFeatured: false,
        },
  });

  const editorInitState = useCallback(
    (editor: Editor) => {
      if (defaultValues?.description) {
        const editorState = parseStringifiedEditorState(
          defaultValues.description,
          editor,
        );
        editor.setEditorState(editorState);
      }
    },
    [defaultValues?.description],
  );

  const onSubmit: SubmitHandler<ProductSchema> = (data) => {
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
            <>
              <Editor
                initialState={editorInitState}
                onChange={(editorState) => {
                  field.onChange(stringifyEditorState(editorState));
                }}
              />
              <FormHelperText error>{fieldState.error?.message}</FormHelperText>
            </>
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
        <Controller
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="Is featured product?"
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
