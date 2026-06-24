import { z } from 'zod';

const seoSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().min(2).max(50),
  description: z.string().min(10),
  shortDescription: z.string().max(500).optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive', 'draft']).optional().default('draft'),
  seo: seoSchema.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const bulkStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(['active', 'inactive', 'draft']),
});

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  parent: z.string().optional(),
  order: z.number().optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
