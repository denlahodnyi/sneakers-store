import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().trim().min(1).max(50),
  isActive: z.boolean(),
  iconUrl: z
    .literal('')
    .transform(() => null)
    .or(z.string().trim().url())
    .nullish(),
});

export type BrandSchema = z.infer<typeof brandSchema>;
