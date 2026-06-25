import { testimonialRepository } from './testimonial.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreateTestimonialInput } from '../../validators/testimonial.validator';

export const testimonialService = {
  async getPublicTestimonials(query: Record<string, unknown>) {
    return testimonialRepository.findActive({
      featured: query.featured === 'true' ? true : undefined,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    });
  },

  async getAllTestimonials(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return testimonialRepository.findAll(filter as never, { page, limit, sort });
  },

  async getTestimonialById(id: string) {
    const t = await testimonialRepository.findById(id);
    if (!t) throw AppError.notFound('Testimonial');
    return t;
  },

  async createTestimonial(data: CreateTestimonialInput, createdBy: string) {
    return testimonialRepository.create({ ...data, createdBy } as Record<string, unknown>);
  },

  async updateTestimonial(id: string, data: Partial<CreateTestimonialInput>, updatedBy: string) {
    const t = await testimonialRepository.update(id, { ...data, updatedBy } as never);
    if (!t) throw AppError.notFound('Testimonial');
    return t;
  },

  async deleteTestimonial(id: string) {
    if (!(await testimonialRepository.softDelete(id))) throw AppError.notFound('Testimonial');
  },

  async uploadAvatar(id: string, buffer: Buffer) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/testimonials');
    const t = await testimonialRepository.update(id, {
      avatar: { url: image.url, publicId: image.publicId },
    } as never);
    if (!t) throw AppError.notFound('Testimonial');
    return t;
  },
};
