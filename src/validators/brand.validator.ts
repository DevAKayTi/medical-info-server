import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
