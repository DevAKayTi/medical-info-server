import { Career, ICareer } from '../../database/models/Career.model';
import { Applicant, IApplicant } from '../../database/models/Applicant.model';
import { BaseRepository } from '../../shared/BaseRepository';
import { buildSearchFilter } from '../../utils/filterBuilder';

export class CareerRepository extends BaseRepository<ICareer> {
  constructor() { super(Career); }

  async findActive(query: { search?: string; department?: string; type?: string; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { status: 'active', deletedAt: null };
    if (query.department) filter['department'] = query.department;
    if (query.type) filter['type'] = query.type;
    if (query.search) {
      const search = buildSearchFilter(query.search, ['title', 'department', 'location']);
      Object.assign(filter, search);
    }
    return this.findAll(filter as never, { page: query.page, limit: query.limit, sort: { postedAt: -1 } });
  }

  async findBySlug(slug: string) {
    return Career.findOne({ slug, status: 'active', deletedAt: null }).lean();
  }

  async slugExists(slug: string, excludeId?: string) {
    const q: Record<string, unknown> = { slug };
    if (excludeId) q['_id'] = { $ne: excludeId };
    return !!(await Career.exists(q));
  }

  async incrementApplicantCount(id: string) {
    await Career.updateOne({ _id: id }, { $inc: { applicantCount: 1 } });
  }
}

export class ApplicantRepository extends BaseRepository<IApplicant> {
  constructor() { super(Applicant); }

  async findByJob(jobId: string, query: { status?: string; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { job: jobId };
    if (query.status) filter['status'] = query.status;
    return this.findAll(filter as never, { page: query.page, limit: query.limit, sort: { createdAt: -1 } });
  }
}

export const careerRepository = new CareerRepository();
export const applicantRepository = new ApplicantRepository();
