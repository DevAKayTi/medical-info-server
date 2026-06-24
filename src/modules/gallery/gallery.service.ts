import { galleryRepository } from './gallery.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';

export const galleryService = {
  async getGallery(query: Record<string, unknown>) {
    return galleryRepository.findWithFilters({
      search: query.search as string,
      category: query.category as string,
      featured: query.featured === 'true' ? true : undefined,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 24),
    });
  },

  async getCategories() {
    return galleryRepository.getCategories();
  },

  async uploadImage(buffer: Buffer, data: { title: string; alt: string; category?: string; description?: string; tags?: string[] }, uploadedBy: string) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/gallery');
    const thumbnailUrl = cloudinaryService.getThumbnailUrl(image.publicId);

    return galleryRepository.create({
      ...data,
      image: { url: image.url, publicId: image.publicId, width: image.width, height: image.height, format: image.format, bytes: image.bytes },
      thumbnail: { url: thumbnailUrl, publicId: image.publicId },
      uploadedBy,
    } as Record<string, unknown>);
  },

  async updateImage(id: string, data: Record<string, unknown>) {
    const image = await galleryRepository.update(id, data as never);
    if (!image) throw AppError.notFound('Image');
    return image;
  },

  async deleteImage(id: string) {
    const image = await galleryRepository.findById(id);
    if (!image) throw AppError.notFound('Image');
    const imageTyped = image as unknown as { image: { publicId: string } };
    await cloudinaryService.deleteFile(imageTyped.image.publicId);
    await galleryRepository.softDelete(id);
  },

  async bulkDelete(ids: string[]) {
    const images = await Promise.all(ids.map((id) => galleryRepository.findById(id)));
    await Promise.all(images.filter(Boolean).map((img) => {
      const imgTyped = img as unknown as { image: { publicId: string } };
      return cloudinaryService.deleteFile(imgTyped.image.publicId);
    }));
    await Promise.all(ids.map((id) => galleryRepository.softDelete(id)));
    return ids.length;
  },
};
