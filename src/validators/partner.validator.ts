import { z } from 'zod';

export const createPartnerSchema = z.object({
  name: z.string().min(2).max(100),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  order: z.number().optional().default(0),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
