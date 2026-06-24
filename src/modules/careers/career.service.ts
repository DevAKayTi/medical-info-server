import { careerRepository, applicantRepository } from './career.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { emailService } from '../../services/email.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreateCareerInput, ApplyCareerInput } from '../../validators/career.validator';

export const careerService = {
  // Public
  async getActiveJobs(query: Record<string, unknown>) {
    return careerRepository.findActive({
      search: query.search as string,
      department: query.department as string,
      type: query.type as string,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    });
  },

  async getJobBySlug(slug: string) {
    const job = await careerRepository.findBySlug(slug);
    if (!job) throw AppError.notFound('Job');
    return job;
  },

  async applyForJob(jobId: string, data: ApplyCareerInput, resumeBuffer: Buffer, originalName: string) {
    const job = await careerRepository.findById(jobId);
    if (!job) throw AppError.notFound('Job');
    const jobTyped = job as unknown as { status: string; title: string };
    if (jobTyped.status !== 'active') throw AppError.badRequest('This job is no longer accepting applications');

    const resume = await cloudinaryService.uploadDocument(resumeBuffer, 'medisource/resumes');

    const applicant = await applicantRepository.create({
      job: jobId,
      ...data,
      resume: { url: resume.url, publicId: resume.publicId, filename: originalName },
    } as Record<string, unknown>);

    await careerRepository.incrementApplicantCount(jobId);

    emailService.sendApplicantNotification({ name: data.name, email: data.email, jobTitle: jobTyped.title }).catch(console.error);

    return applicant;
  },

  // Admin
  async getAllJobs(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    return careerRepository.findAll(filter as never, { page, limit, sort });
  },

  async getJobById(id: string) {
    const job = await careerRepository.findById(id);
    if (!job) throw AppError.notFound('Job');
    return job;
  },

  async createJob(data: CreateCareerInput, createdBy: string) {
    const slug = await generateUniqueSlug(data.title, (s) => careerRepository.slugExists(s));
    return careerRepository.create({ ...data, slug, createdBy, postedAt: data.status === 'active' ? new Date() : undefined } as Record<string, unknown>);
  },

  async updateJob(id: string, data: Partial<CreateCareerInput>, updatedBy: string) {
    let slug: string | undefined;
    if (data.title) slug = await generateUniqueSlug(data.title, (s) => careerRepository.slugExists(s, id));
    const job = await careerRepository.update(id, { ...data, ...(slug && { slug }), updatedBy } as never);
    if (!job) throw AppError.notFound('Job');
    return job;
  },

  async deleteJob(id: string) {
    if (!(await careerRepository.softDelete(id))) throw AppError.notFound('Job');
  },

  async getApplicants(jobId: string, query: Record<string, unknown>) {
    return applicantRepository.findByJob(jobId, {
      status: query.status as string,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    });
  },

  async updateApplicantStatus(id: string, status: string, notes?: string, reviewedBy?: string) {
    const applicant = await applicantRepository.update(id, { status, ...(notes && { notes }), ...(reviewedBy && { reviewedBy }) } as never);
    if (!applicant) throw AppError.notFound('Applicant');
    return applicant;
  },
};
