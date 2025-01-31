'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import {
  DiscountType,
  type DiscountResponseDto,
} from '@sneakers-store/contracts';
import { startTransition, useActionState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

import {
  discountSchema,
  discountTypes,
  type DiscountSchema,
} from '~/entities/discount';
import { createOrUpdateDiscount } from '../_api/discounts.server-fn';

type DiscountFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
} & (
  | {
      actionType: 'create';
      id?: never;
      defaultValues: Omit<
        Partial<DiscountResponseDto>,
        'id' | 'createdAt' | 'updatedAt'
      > & { productVarId: DiscountResponseDto['productVarId'] };
    }
  | {
      actionType: 'edit';
      id: string;
      defaultValues: Omit<
        Partial<DiscountResponseDto>,
        'id' | 'createdAt' | 'updatedAt'
      > & {
        productVarId: DiscountResponseDto['productVarId'];
      };
    }
);

export default function DiscountForm({
  defaultValues,
  id,
  actionType,
  onCancel,
  onSuccess,
}: DiscountFormProps) {
  const [state, action, pending] = useActionState(
    createOrUpdateDiscount,
    undefined,
  );
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { isDirty },
  } = useForm<DiscountSchema>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      productVarId: defaultValues.productVarId,
      discountType: defaultValues.discountType ?? DiscountType.PERCENTAGE,
      discountValue: defaultValues.discountValue ?? 0,
      isActive: defaultValues.isActive ?? true,
    },
  });
  const selectedDiscountType = watch('discountType');

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
    if (state?.success) onSuccess();
  }, [onSuccess, state?.success]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        startTransition(() => {
          action(
            actionType === 'edit'
              ? { ...data, _action: 'edit', id }
              : { ...data, _action: 'create' },
          );
        });
      })}
    >
      <FormGroup className="mb-3">
        <FormGroup row className="gap-2">
          <Controller
            control={control}
            name="discountType"
            render={({ field, fieldState }) => (
              <TextField
                required
                select
                label="Discount type"
                {...field}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue('discountValue', 0);
                }}
              >
                {discountTypes.map((dt) => (
                  <MenuItem key={dt} value={dt}>
                    {dt[0].toUpperCase() + dt.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="discountValue"
            render={({ field, fieldState }) => (
              <NumericFormat
                required
                allowNegative={false}
                customInput={TextField}
                decimalScale={selectedDiscountType === 'FIXED' ? 2 : 0}
                label="Discount"
                prefix={selectedDiscountType === 'FIXED' ? '$' : '%'}
                thousandSeparator={selectedDiscountType === 'FIXED'}
                valueIsNumericString={false}
                {...field}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                onChange={undefined}
                onValueChange={(values) => field.onChange(values.floatValue)}
              />
            )}
          />
        </FormGroup>
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormControlLabel
              {...field}
              checked={field.value}
              control={<Switch />}
              label="Active"
              onChange={(e, checked) => field.onChange(checked)}
            />
          )}
        />
      </FormGroup>
      <Button
        className="mr-2"
        disabled={pending || !isDirty}
        type="submit"
        variant="contained"
      >
        {pending && (
          <CircularProgress className="mr-1" color="inherit" size="20px" />
        )}
        Save
      </Button>
      <Button onClick={onCancel}>Cancel</Button>
    </form>
  );
}
