import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const notificationController = {
  async getMyNotifications(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await notificationService.getMyNotifications(req.user!.id, page, limit);
    return ApiResponse.paginated(res, result.data, result.meta);
  },

  async getUnreadCount(req: Request, res: Response) {
    const count = await notificationService.getUnreadCount(req.user!.id);
    return ApiResponse.success(res, { count });
  },

  async markAsRead(req: Request, res: Response) {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    return ApiResponse.success(res, notification, 'Notification marked as read');
  },

  async markAllAsRead(req: Request, res: Response) {
    const result = await notificationService.markAllAsRead(req.user!.id);
    return ApiResponse.success(res, null, result.message);
  },

  async deleteNotification(req: Request, res: Response) {
    await notificationService.deleteNotification(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Notification deleted');
  },
};
