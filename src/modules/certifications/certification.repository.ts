import { Certification, ICertification } from '../../database/models/Certification.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class CertificationRepository extends BaseRepository<ICertification> {
  constructor() { super(Certification); }

  async findPublic(query: { type?: string; status?: string; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.status) filter['status'] = query.status;
    else filter['status'] = 'valid';
    if (query.type) filter['type'] = query.type;
    return this.findAll(filter as never, {
      page: query.page,
      limit: query.limit,
      sort: { issueDate: -1 },
    });
  }

  async slugExists(slug: string, excludeId?: string) {
    const q: Record<string, unknown> = { slug };
    if (excludeId) q['_id'] = { $ne: excludeId };
    return !!(await Certification.exists(q));
  }
}

export const certificationRepository = new CertificationRepository();
