import { SizeSystem } from '@sneakers-store/contracts';
import { z } from 'zod';

export const sizeSchema = z.object({
  size: z
    .string()
    .pipe(z.preprocess((v) => parseFloat(v as string), z.number().positive())),
  system: z
    .literal('')
    .transform(() => null)
    .or(z.enum([SizeSystem.EU, SizeSystem.US]))
    .nullish(),
  isActive: z.boolean(),
});

export type SizeSchema = z.infer<typeof sizeSchema>;
