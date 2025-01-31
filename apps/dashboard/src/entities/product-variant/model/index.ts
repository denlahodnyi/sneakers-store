import { z } from 'zod';

export const productVarScheme = z.object({
  productId: z.string().uuid(),
  colorId: z.coerce.number().min(1, 'Must be selected'),
  name: z
    .string()
    .trim()
    .max(255)
    .or(z.literal('').transform(() => null))
    .nullish(),
  slug: z
    .string()
    .trim()
    .max(255)
    .or(z.literal('').transform(() => null))
    .nullish(),
  images: z
    .array(
      z.object({
        publicId: z.string(),
        url: z.string(),
        width: z.number().nullable(),
        height: z.number().nullable(),
        alt: z.string().nullable(),
      }),
    )
    .nullish(),
});

export type ProductVarScheme = z.infer<typeof productVarScheme>;
