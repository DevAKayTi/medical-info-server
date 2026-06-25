import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(2).max(200),
  excerpt: z.string().min(5).max(500),
  description: z.string().min(10),
  icon: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  order: z.number().optional().default(0),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
