import { Request, Response } from 'express';
import { newsService } from './news.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const newsController = {
  async getPublicNews(req: Request, res: Response) {
    const result = await newsService.getPublicNews(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getPublicNewsBySlug(req: Request, res: Response) {
    const article = await newsService.getPublicNewsBySlug(req.params.slug);
    return ApiResponse.success(res, article);
  },
  async getAllNews(req: Request, res: Response) {
    const result = await newsService.getAllNews(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getNewsById(req: Request, res: Response) {
    const article = await newsService.getNewsById(req.params.id);
    return ApiResponse.success(res, article);
  },
  async createNews(req: Request, res: Response) {
    const article = await newsService.createNews(req.body, req.user!.id);
    return ApiResponse.created(res, article, 'Article created');
  },
  async updateNews(req: Request, res: Response) {
    const article = await newsService.updateNews(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, article, 'Article updated');
  },
  async publishNews(req: Request, res: Response) {
    const article = await newsService.publishNews(req.params.id, req.user!.id);
    return ApiResponse.success(res, article, 'Article published');
  },
  async unpublishNews(req: Request, res: Response) {
    const article = await newsService.unpublishNews(req.params.id, req.user!.id);
    return ApiResponse.success(res, article, 'Article unpublished');
  },
  async deleteNews(req: Request, res: Response) {
    await newsService.deleteNews(req.params.id);
    return ApiResponse.success(res, null, 'Article deleted');
  },
  async uploadCoverImage(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const article = await newsService.uploadCoverImage(req.params.id, req.file.buffer);
    return ApiResponse.success(res, article, 'Cover image uploaded');
  },
};
