import { partnerRepository } from './partner.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreatePartnerInput, UpdatePartnerInput } from '../../validators/partner.validator';

export const partnerService = {
  async getPublicPartners(query: Record<string, unknown>) {
    return partnerRepository.findActive({
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
    });
  },

  async getAllPartners(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return partnerRepository.findAll(filter as never, { page, limit, sort });
  },

  async getPartnerById(id: string) {
    const partner = await partnerRepository.findById(id);
    if (!partner) throw AppError.notFound('Partner');
    return partner;
  },

  async createPartner(data: CreatePartnerInput, createdBy: string) {
    return partnerRepository.create({ ...data, createdBy } as Record<string, unknown>);
  },

  async updatePartner(id: string, data: UpdatePartnerInput, updatedBy: string) {
    const partner = await partnerRepository.update(id, { ...data, updatedBy } as never);
    if (!partner) throw AppError.notFound('Partner');
    return partner;
  },

  async deletePartner(id: string) {
    const partner = await partnerRepository.findById(id);
    if (!partner) throw AppError.notFound('Partner');
    const p = partner as unknown as { logo?: { publicId?: string } };
    if (p.logo?.publicId) {
      await cloudinaryService.deleteFile(p.logo.publicId).catch(() => null);
    }
    await partnerRepository.softDelete(id);
  },

  async uploadLogo(id: string, buffer: Buffer) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/partners');
    const partner = await partnerRepository.update(id, {
      logo: { url: image.url, publicId: image.publicId },
    } as never);
    if (!partner) throw AppError.notFound('Partner');
    return partner;
  },
};
