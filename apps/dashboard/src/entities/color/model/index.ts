import { z } from 'zod';

export const colorSchema = z.object({
  name: z.string().trim().min(1).max(50),
  isActive: z.boolean(),
  hexes: z.array(
    z.object({
      hex: z
        .string()
        .startsWith('#', 'Should start with #')
        .regex(/^#([0-9a-f]{6})$/i)
        .trim(),
    }),
  ),
});

export type ColorSchema = z.infer<typeof colorSchema>;
