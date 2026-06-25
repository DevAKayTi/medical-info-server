import { brandRepository } from './brand.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreateBrandInput, UpdateBrandInput } from '../../validators/brand.validator';

export const brandService = {
  // Public
  async getPublicBrands(query: Record<string, unknown>) {
    return brandRepository.findActive({
      search: query.search as string,
      category: query.category as string,
      featured: query.featured === 'true' ? true : undefined,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
    });
  },

  // Admin
  async getAllBrands(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return brandRepository.findAll(filter as never, { page, limit, sort });
  },

  async getBrandById(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw AppError.notFound('Brand');
    return brand;
  },

  async createBrand(data: CreateBrandInput, createdBy: string) {
    const slug = await generateUniqueSlug(data.name, (s) => brandRepository.slugExists(s));
    return brandRepository.create({ ...data, slug, createdBy } as Record<string, unknown>);
  },

  async updateBrand(id: string, data: UpdateBrandInput, updatedBy: string) {
    let slug: string | undefined;
    if (data.name) {
      slug = await generateUniqueSlug(data.name, (s) => brandRepository.slugExists(s, id));
    }
    const brand = await brandRepository.update(id, {
      ...data,
      ...(slug && { slug }),
      updatedBy,
    } as never);
    if (!brand) throw AppError.notFound('Brand');
    return brand;
  },

  async deleteBrand(id: string) {
    if (!(await brandRepository.softDelete(id))) throw AppError.notFound('Brand');
  },

  async uploadLogo(id: string, buffer: Buffer) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/brands');
    const brand = await brandRepository.update(id, {
      logo: { url: image.url, publicId: image.publicId },
    } as never);
    if (!brand) throw AppError.notFound('Brand');
    return brand;
  },
};
