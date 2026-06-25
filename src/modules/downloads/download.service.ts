import { downloadRepository } from './download.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreateDownloadInput } from '../../validators/download.validator';

export const downloadService = {
  async getPublicDownloads(query: Record<string, unknown>) {
    return downloadRepository.findActive({
      search: query.search as string,
      category: query.category as string,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    });
  },

  async trackAndGetUrl(id: string): Promise<string> {
    const download = await downloadRepository.findById(id);
    if (!download) throw AppError.notFound('Download');
    const d = download as unknown as { status: string; file: { url: string } };
    if (d.status !== 'active') throw AppError.notFound('Download');
    await downloadRepository.incrementDownloadCount(id);
    return d.file.url;
  },

  async getAllDownloads(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return downloadRepository.findAll(filter as never, { page, limit, sort });
  },

  async getDownloadById(id: string) {
    const d = await downloadRepository.findById(id);
    if (!d) throw AppError.notFound('Download');
    return d;
  },

  async createDownload(data: CreateDownloadInput, fileBuffer: Buffer, originalName: string, createdBy: string) {
    const fileResult = await cloudinaryService.uploadDocument(fileBuffer, 'medisource/downloads');
    const slug = await generateUniqueSlug(data.title, (s) => downloadRepository.slugExists(s));
    return downloadRepository.create({
      ...data,
      slug,
      file: { url: fileResult.url, publicId: fileResult.publicId, filename: originalName, size: fileResult.size },
      createdBy,
    } as Record<string, unknown>);
  },

  async updateDownload(id: string, data: Partial<CreateDownloadInput>, updatedBy: string) {
    const d = await downloadRepository.update(id, { ...data, updatedBy } as never);
    if (!d) throw AppError.notFound('Download');
    return d;
  },

  async deleteDownload(id: string) {
    const d = await downloadRepository.findById(id);
    if (!d) throw AppError.notFound('Download');
    const dTyped = d as unknown as { file?: { publicId?: string } };
    if (dTyped.file?.publicId) {
      await cloudinaryService.deleteFile(dTyped.file.publicId, 'raw').catch(() => null);
    }
    await downloadRepository.softDelete(id);
  },
};
