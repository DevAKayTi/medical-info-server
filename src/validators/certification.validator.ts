import { z } from 'zod';

export const createCertificationSchema = z.object({
  name: z.string().min(2).max(200),
  issuer: z.string().min(2),
  type: z.enum(['ISO', 'GMP', 'FDA', 'WHO', 'CE', 'Other']),
  description: z.string().optional(),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
