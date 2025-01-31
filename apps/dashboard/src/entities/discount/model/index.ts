import { DiscountType } from '@sneakers-store/contracts';
import { z } from 'zod';

export const discountSchema = z.object({
  productVarId: z
    .string()
    .min(1, { message: 'Product variant ID is required' }),
  discountType: z.enum([DiscountType.FIXED, DiscountType.PERCENTAGE]),
  discountValue: z
    .number()
    .positive()
    .or(
      z
        .string()
        .pipe(
          z.preprocess((v) => parseFloat(v as string), z.number().positive()),
        ),
    ),
  isActive: z.boolean(),
});

export type DiscountSchema = z.infer<typeof discountSchema>;

export const discountTypes = Object.values(DiscountType);
