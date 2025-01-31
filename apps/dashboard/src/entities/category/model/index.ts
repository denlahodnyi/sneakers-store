import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(50),
  isActive: z.boolean(),
  slug: z
    .string()
    .toLowerCase()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[\d\w-]*$/, 'Only digits, words and hyphens are allowed'),
  parentId: z
    .literal('')
    .transform(() => null)
    .or(z.coerce.number().int().positive())
    .nullish(),
});

export type CategorySchema = z.infer<typeof categorySchema>;
