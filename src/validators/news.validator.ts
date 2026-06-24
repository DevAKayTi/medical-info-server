import { z } from 'zod';

export const createNewsSchema = z.object({
  title: z.string().min(5).max(300),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional().default(false),
  status: z.enum(['published', 'draft', 'scheduled', 'archived']).optional().default('draft'),
  scheduledAt: z.string().datetime().optional().nullable(),
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    metaKeywords: z.string().optional(),
  }).optional(),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
