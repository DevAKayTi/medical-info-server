import { Request, Response } from 'express';
import { inquiryService } from './inquiry.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const inquiryController = {
  async submitInquiry(req: Request, res: Response) {
    const ip = req.ip ?? req.socket.remoteAddress;
    const inquiry = await inquiryService.submitInquiry(req.body, ip);
    return ApiResponse.created(res, inquiry, 'Inquiry submitted successfully. We will contact you soon.');
  },

  async getInquiries(req: Request, res: Response) {
    const result = await inquiryService.getInquiries(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },

  async getInquiryById(req: Request, res: Response) {
    const inquiry = await inquiryService.getInquiryById(req.params.id);
    return ApiResponse.success(res, inquiry);
  },

  async updateStatus(req: Request, res: Response) {
    const inquiry = await inquiryService.updateStatus(req.params.id, req.body.status, req.body.assignedTo);
    return ApiResponse.success(res, inquiry, 'Status updated');
  },

  async respond(req: Request, res: Response) {
    const inquiry = await inquiryService.respond(req.params.id, req.body.response, req.user!.id);
    return ApiResponse.success(res, inquiry, 'Response sent');
  },

  async archiveInquiry(req: Request, res: Response) {
    const inquiry = await inquiryService.archiveInquiry(req.params.id);
    return ApiResponse.success(res, inquiry, 'Inquiry archived');
  },
};
