import { Request, Response } from 'express';
import { brandService } from './brand.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const brandController = {
  async getPublicBrands(req: Request, res: Response) {
    const result = await brandService.getPublicBrands(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getAllBrands(req: Request, res: Response) {
    const result = await brandService.getAllBrands(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getBrandById(req: Request, res: Response) {
    const brand = await brandService.getBrandById(req.params.id);
    return ApiResponse.success(res, brand);
  },
  async createBrand(req: Request, res: Response) {
    const brand = await brandService.createBrand(req.body, req.user!.id);
    return ApiResponse.created(res, brand, 'Brand created');
  },
  async updateBrand(req: Request, res: Response) {
    const brand = await brandService.updateBrand(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, brand, 'Brand updated');
  },
  async deleteBrand(req: Request, res: Response) {
    await brandService.deleteBrand(req.params.id);
    return ApiResponse.success(res, null, 'Brand deleted');
  },
  async uploadLogo(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const brand = await brandService.uploadLogo(req.params.id, req.file.buffer);
    return ApiResponse.success(res, brand, 'Logo uploaded');
  },
};
