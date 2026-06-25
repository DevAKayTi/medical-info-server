import { Request, Response } from 'express';
import { partnerService } from './partner.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const partnerController = {
  async getPublicPartners(req: Request, res: Response) {
    const result = await partnerService.getPublicPartners(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getAllPartners(req: Request, res: Response) {
    const result = await partnerService.getAllPartners(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getPartnerById(req: Request, res: Response) {
    const partner = await partnerService.getPartnerById(req.params.id);
    return ApiResponse.success(res, partner);
  },
  async createPartner(req: Request, res: Response) {
    const partner = await partnerService.createPartner(req.body, req.user!.id);
    return ApiResponse.created(res, partner, 'Partner created');
  },
  async updatePartner(req: Request, res: Response) {
    const partner = await partnerService.updatePartner(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, partner, 'Partner updated');
  },
  async deletePartner(req: Request, res: Response) {
    await partnerService.deletePartner(req.params.id);
    return ApiResponse.success(res, null, 'Partner deleted');
  },
  async uploadLogo(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const partner = await partnerService.uploadLogo(req.params.id, req.file.buffer);
    return ApiResponse.success(res, partner, 'Logo uploaded');
  },
};
