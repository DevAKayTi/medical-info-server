import { z } from 'zod';

export const createCareerSchema = z.object({
  title: z.string().min(3).max(200),
  department: z.string().min(1),
  location: z.string().min(1),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experience: z.string().min(1),
  salaryRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
    period: z.string().default('monthly'),
  }).optional(),
  description: z.string().min(20),
  responsibilities: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'expired', 'draft', 'paused']).optional().default('draft'),
  deadline: z.string().datetime().optional().nullable(),
});

export const updateCareerSchema = createCareerSchema.partial();

export const applyCareerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7),
  yearsOfExperience: z.number().min(0).optional(),
  coverLetter: z.string().max(5000).optional(),
});

export const updateApplicantStatusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'shortlisted', 'rejected', 'hired']),
  notes: z.string().optional(),
});

export type CreateCareerInput = z.infer<typeof createCareerSchema>;
export type ApplyCareerInput = z.infer<typeof applyCareerSchema>;
