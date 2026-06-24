import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  roleId: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  roleId: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
