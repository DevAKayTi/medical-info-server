import { Request, Response } from 'express';
import { testimonialService } from './testimonial.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const testimonialController = {
  async getPublicTestimonials(req: Request, res: Response) {
    const result = await testimonialService.getPublicTestimonials(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getAllTestimonials(req: Request, res: Response) {
    const result = await testimonialService.getAllTestimonials(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getTestimonialById(req: Request, res: Response) {
    const t = await testimonialService.getTestimonialById(req.params.id);
    return ApiResponse.success(res, t);
  },
  async createTestimonial(req: Request, res: Response) {
    const t = await testimonialService.createTestimonial(req.body, req.user!.id);
    return ApiResponse.created(res, t, 'Testimonial created');
  },
  async updateTestimonial(req: Request, res: Response) {
    const t = await testimonialService.updateTestimonial(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, t, 'Testimonial updated');
  },
  async deleteTestimonial(req: Request, res: Response) {
    await testimonialService.deleteTestimonial(req.params.id);
    return ApiResponse.success(res, null, 'Testimonial deleted');
  },
  async uploadAvatar(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const t = await testimonialService.uploadAvatar(req.params.id, req.file.buffer);
    return ApiResponse.success(res, t, 'Avatar uploaded');
  },
};
