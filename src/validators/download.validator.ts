import { z } from 'zod';

export const createDownloadSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  requiresAuth: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateDownloadSchema = createDownloadSchema.partial();

export type CreateDownloadInput = z.infer<typeof createDownloadSchema>;
