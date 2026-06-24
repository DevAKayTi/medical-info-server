import { z } from 'zod';

export const createInquirySchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'archived']),
  assignedTo: z.string().optional(),
});

export const respondInquirySchema = z.object({
  response: z.string().min(10),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
