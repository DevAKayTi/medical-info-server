import { Request, Response } from 'express';
import { downloadService } from './download.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AppError } from '../../shared/AppError';

export const downloadController = {
  async getPublicDownloads(req: Request, res: Response) {
    const result = await downloadService.getPublicDownloads(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async downloadFile(req: Request, res: Response) {
    const url = await downloadService.trackAndGetUrl(req.params.id);
    return res.redirect(url);
  },
  async getAllDownloads(req: Request, res: Response) {
    const result = await downloadService.getAllDownloads(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getDownloadById(req: Request, res: Response) {
    const d = await downloadService.getDownloadById(req.params.id);
    return ApiResponse.success(res, d);
  },
  async createDownload(req: Request, res: Response) {
    if (!req.file) throw AppError.badRequest('File is required');
    const d = await downloadService.createDownload(req.body, req.file.buffer, req.file.originalname, req.user!.id);
    return ApiResponse.created(res, d, 'Download created');
  },
  async updateDownload(req: Request, res: Response) {
    const d = await downloadService.updateDownload(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, d, 'Download updated');
  },
  async deleteDownload(req: Request, res: Response) {
    await downloadService.deleteDownload(req.params.id);
    return ApiResponse.success(res, null, 'Download deleted');
  },
};
