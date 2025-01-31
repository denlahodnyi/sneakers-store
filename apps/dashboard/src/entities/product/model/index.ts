import { Gender } from '@sneakers-store/contracts';
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().nullish(),
  gender: z.enum([Gender.MEN, Gender.WOMEN, Gender.KIDS]),
  brandId: z.coerce.number().min(1, 'Must be selected'),
  categoryId: z.coerce.number().min(1, 'Must be selected'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

export type ProductSchema = z.infer<typeof productSchema>;
