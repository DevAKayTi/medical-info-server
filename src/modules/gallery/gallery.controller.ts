import { Request, Response } from 'express';
import { galleryService } from './gallery.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AppError } from '../../shared/AppError';

export const galleryController = {
  async getGallery(req: Request, res: Response) {
    const result = await galleryService.getGallery(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getCategories(req: Request, res: Response) {
    const categories = await galleryService.getCategories();
    return ApiResponse.success(res, categories);
  },
  async uploadImage(req: Request, res: Response) {
    if (!req.file) throw AppError.badRequest('No image provided');
    const { title, alt, category, description, tags } = req.body;
    const parsedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [];
    const image = await galleryService.uploadImage(req.file.buffer, { title, alt, category, description, tags: parsedTags }, req.user!.id);
    return ApiResponse.created(res, image, 'Image uploaded');
  },
  async updateImage(req: Request, res: Response) {
    const image = await galleryService.updateImage(req.params.id, req.body);
    return ApiResponse.success(res, image, 'Image updated');
  },
  async deleteImage(req: Request, res: Response) {
    await galleryService.deleteImage(req.params.id);
    return ApiResponse.success(res, null, 'Image deleted');
  },
  async bulkDelete(req: Request, res: Response) {
    const count = await galleryService.bulkDelete(req.body.ids);
    return ApiResponse.success(res, { deleted: count }, `${count} images deleted`);
  },
};
