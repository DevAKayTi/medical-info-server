import { categoryRepository } from './category.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions } from '../../utils/filterBuilder';

export const categoryService = {
  async getPublicCategories() {
    return categoryRepository.findWithProductCounts();
  },

  async getAllCategories(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return categoryRepository.findAll(filter as never, { page, limit, sort });
  },

  async getCategoryById(id: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat) throw AppError.notFound('Category');
    return cat;
  },

  async createCategory(data: Record<string, unknown>, createdBy: string) {
    const slug = await generateUniqueSlug(String(data.name), (s) => categoryRepository.slugExists(s));
    return categoryRepository.create({ ...data, slug, createdBy } as Record<string, unknown>);
  },

  async updateCategory(id: string, data: Record<string, unknown>, updatedBy: string) {
    let slug: string | undefined;
    if (data.name) slug = await generateUniqueSlug(String(data.name), (s) => categoryRepository.slugExists(s, id));
    const cat = await categoryRepository.update(id, { ...data, ...(slug && { slug }), updatedBy } as never);
    if (!cat) throw AppError.notFound('Category');
    return cat;
  },

  async deleteCategory(id: string) {
    if (!(await categoryRepository.softDelete(id))) throw AppError.notFound('Category');
  },

  async uploadImage(id: string, buffer: Buffer) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/categories');
    const cat = await categoryRepository.update(id, {
      image: { url: image.url, publicId: image.publicId },
    } as never);
    if (!cat) throw AppError.notFound('Category');
    return cat;
  },
};
