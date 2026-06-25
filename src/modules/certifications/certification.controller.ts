import { Request, Response } from 'express';
import { certificationService } from './certification.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const certificationController = {
  async getPublicCertifications(req: Request, res: Response) {
    const result = await certificationService.getPublicCertifications(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getAllCertifications(req: Request, res: Response) {
    const result = await certificationService.getAllCertifications(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getCertificationById(req: Request, res: Response) {
    const cert = await certificationService.getCertificationById(req.params.id);
    return ApiResponse.success(res, cert);
  },
  async createCertification(req: Request, res: Response) {
    const cert = await certificationService.createCertification(req.body, req.user!.id);
    return ApiResponse.created(res, cert, 'Certification created');
  },
  async updateCertification(req: Request, res: Response) {
    const cert = await certificationService.updateCertification(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, cert, 'Certification updated');
  },
  async deleteCertification(req: Request, res: Response) {
    await certificationService.deleteCertification(req.params.id);
    return ApiResponse.success(res, null, 'Certification deleted');
  },
  async uploadImage(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const cert = await certificationService.uploadImage(req.params.id, req.file.buffer);
    return ApiResponse.success(res, cert, 'Image uploaded');
  },
};
