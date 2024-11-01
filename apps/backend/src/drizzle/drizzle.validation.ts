import { z } from 'zod';

export const drizzleModuleOptionsSchema = z.object({
  host: z.string().min(1),
  port: z.number(),
  user: z.string().min(1),
  password: z.string().min(1),
  database: z.string().min(1),
});

export type DrizzleModuleOptions = z.infer<typeof drizzleModuleOptionsSchema>;
