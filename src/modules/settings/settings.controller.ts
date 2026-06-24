import { Request, Response } from 'express';
import { settingsService } from './settings.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const settingsController = {
  async getSettings(req: Request, res: Response) {
    const settings = await settingsService.getSettings();
    return ApiResponse.success(res, settings);
  },
  async updateSettings(req: Request, res: Response) {
    const settings = await settingsService.updateSettings(req.body, req.user!.id);
    return ApiResponse.success(res, settings, 'Settings updated');
  },
  async uploadLogo(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const settings = await settingsService.uploadLogo(req.file.buffer, req.user!.id);
    return ApiResponse.success(res, settings, 'Logo updated');
  },
  async uploadFavicon(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const settings = await settingsService.uploadFavicon(req.file.buffer, req.user!.id);
    return ApiResponse.success(res, settings, 'Favicon updated');
  },
};
