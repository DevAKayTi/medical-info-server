import { z } from 'zod';

export const createTestimonialSchema = z.object({
  name: z.string().min(2).max(100),
  position: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5).optional().default(5),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
