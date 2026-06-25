import { certificationRepository } from './certification.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreateCertificationInput } from '../../validators/certification.validator';

export const certificationService = {
  async getPublicCertifications(query: Record<string, unknown>) {
    return certificationRepository.findPublic({
      type: query.type as string,
      status: query.status as string,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    });
  },

  async getAllCertifications(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return certificationRepository.findAll(filter as never, { page, limit, sort });
  },

  async getCertificationById(id: string) {
    const cert = await certificationRepository.findById(id);
    if (!cert) throw AppError.notFound('Certification');
    return cert;
  },

  async createCertification(data: CreateCertificationInput, createdBy: string) {
    const slug = await generateUniqueSlug(data.name, (s) => certificationRepository.slugExists(s));
    return certificationRepository.create({ ...data, slug, createdBy } as Record<string, unknown>);
  },

  async updateCertification(id: string, data: Partial<CreateCertificationInput>, updatedBy: string) {
    let slug: string | undefined;
    if (data.name) slug = await generateUniqueSlug(data.name, (s) => certificationRepository.slugExists(s, id));
    const cert = await certificationRepository.update(id, { ...data, ...(slug && { slug }), updatedBy } as never);
    if (!cert) throw AppError.notFound('Certification');
    return cert;
  },

  async deleteCertification(id: string) {
    if (!(await certificationRepository.softDelete(id))) throw AppError.notFound('Certification');
  },

  async uploadImage(id: string, buffer: Buffer) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/certifications');
    const cert = await certificationRepository.update(id, {
      image: { url: image.url, publicId: image.publicId },
    } as never);
    if (!cert) throw AppError.notFound('Certification');
    return cert;
  },
};
