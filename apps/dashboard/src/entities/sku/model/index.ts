import { z } from 'zod';

export const skuSchema = z.object({
  productId: z.string().uuid(),
  productVarId: z.string().uuid(),
  sizeId: z.coerce
    .number()
    .int()
    .positive()
    .or(z.literal('').transform(() => null))
    .nullish(),
  sku: z.string().trim().min(1).max(50),
  stockQty: z.coerce.number().int().positive(),
  basePrice: z
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

export type SkuSchema = z.infer<typeof skuSchema>;
