import { Role } from '@sneakers-store/contracts';
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  email: z.string().email(),
  role: z
    .literal('')
    .transform(() => null)
    .or(z.enum([Role.SUPER_ADMIN, Role.ADMIN]))
    .optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
