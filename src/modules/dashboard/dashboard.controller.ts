import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const dashboardController = {
  async getStats(req: Request, res: Response) {
    const stats = await dashboardService.getStats();
    return ApiResponse.success(res, stats);
  },
  async getInquiryTrend(req: Request, res: Response) {
    const days = Number(req.query.days ?? 30);
    const data = await dashboardService.getInquiryTrend(days);
    return ApiResponse.success(res, data);
  },
  async getProductsByCategory(req: Request, res: Response) {
    const data = await dashboardService.getProductsByCategory();
    return ApiResponse.success(res, data);
  },
  async getRecentActivity(req: Request, res: Response) {
    const limit = Number(req.query.limit ?? 20);
    const data = await dashboardService.getRecentActivity(limit);
    return ApiResponse.success(res, data);
  },
};
