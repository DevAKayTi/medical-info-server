import { serviceRepository } from './service.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreateServiceInput } from '../../validators/service.validator';

export const companyServiceService = {
  async getPublicServices(query: Record<string, unknown>) {
    return serviceRepository.findActive({
      featured: query.featured === 'true' ? true : undefined,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
    });
  },

  async getAllServices(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return serviceRepository.findAll(filter as never, { page, limit, sort });
  },

  async getServiceById(id: string) {
    const s = await serviceRepository.findById(id);
    if (!s) throw AppError.notFound('Service');
    return s;
  },

  async createService(data: CreateServiceInput, createdBy: string) {
    const slug = await generateUniqueSlug(data.title, (s) => serviceRepository.slugExists(s));
    return serviceRepository.create({ ...data, slug, createdBy } as Record<string, unknown>);
  },

  async updateService(id: string, data: Partial<CreateServiceInput>, updatedBy: string) {
    let slug: string | undefined;
    if (data.title) slug = await generateUniqueSlug(data.title, (s) => serviceRepository.slugExists(s, id));
    const s = await serviceRepository.update(id, { ...data, ...(slug && { slug }), updatedBy } as never);
    if (!s) throw AppError.notFound('Service');
    return s;
  },

  async deleteService(id: string) {
    if (!(await serviceRepository.softDelete(id))) throw AppError.notFound('Service');
  },

  async uploadImage(id: string, buffer: Buffer) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/services');
    const s = await serviceRepository.update(id, {
      image: { url: image.url, publicId: image.publicId },
    } as never);
    if (!s) throw AppError.notFound('Service');
    return s;
  },
};
