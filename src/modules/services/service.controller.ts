import { Request, Response } from 'express';
import { companyServiceService } from './service.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const serviceController = {
  async getPublicServices(req: Request, res: Response) {
    const result = await companyServiceService.getPublicServices(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getAllServices(req: Request, res: Response) {
    const result = await companyServiceService.getAllServices(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getServiceById(req: Request, res: Response) {
    const s = await companyServiceService.getServiceById(req.params.id);
    return ApiResponse.success(res, s);
  },
  async createService(req: Request, res: Response) {
    const s = await companyServiceService.createService(req.body, req.user!.id);
    return ApiResponse.created(res, s, 'Service created');
  },
  async updateService(req: Request, res: Response) {
    const s = await companyServiceService.updateService(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, s, 'Service updated');
  },
  async deleteService(req: Request, res: Response) {
    await companyServiceService.deleteService(req.params.id);
    return ApiResponse.success(res, null, 'Service deleted');
  },
  async uploadImage(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const s = await companyServiceService.uploadImage(req.params.id, req.file.buffer);
    return ApiResponse.success(res, s, 'Image uploaded');
  },
};
