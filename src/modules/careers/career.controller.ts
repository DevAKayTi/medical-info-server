import { Request, Response } from 'express';
import { careerService } from './career.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AppError } from '../../shared/AppError';

export const careerController = {
  async getActiveJobs(req: Request, res: Response) {
    const result = await careerService.getActiveJobs(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getJobBySlug(req: Request, res: Response) {
    const job = await careerService.getJobBySlug(req.params.slug);
    return ApiResponse.success(res, job);
  },
  async applyForJob(req: Request, res: Response) {
    if (!req.file) throw AppError.badRequest('Resume PDF is required');
    const applicant = await careerService.applyForJob(
      req.params.id, req.body, req.file.buffer, req.file.originalname,
    );
    return ApiResponse.created(res, applicant, 'Application submitted successfully');
  },
  async getAllJobs(req: Request, res: Response) {
    const result = await careerService.getAllJobs(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getJobById(req: Request, res: Response) {
    const job = await careerService.getJobById(req.params.id);
    return ApiResponse.success(res, job);
  },
  async createJob(req: Request, res: Response) {
    const job = await careerService.createJob(req.body, req.user!.id);
    return ApiResponse.created(res, job, 'Job created');
  },
  async updateJob(req: Request, res: Response) {
    const job = await careerService.updateJob(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, job, 'Job updated');
  },
  async deleteJob(req: Request, res: Response) {
    await careerService.deleteJob(req.params.id);
    return ApiResponse.success(res, null, 'Job deleted');
  },
  async getApplicants(req: Request, res: Response) {
    const result = await careerService.getApplicants(req.params.id, req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async updateApplicantStatus(req: Request, res: Response) {
    const applicant = await careerService.updateApplicantStatus(
      req.params.applicantId, req.body.status, req.body.notes, req.user!.id,
    );
    return ApiResponse.success(res, applicant, 'Applicant status updated');
  },
};
