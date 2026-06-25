import { Service, IService } from '../../database/models/Service.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class ServiceRepository extends BaseRepository<IService> {
  constructor() { super(Service); }

  async findActive(query?: { featured?: boolean; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { status: 'active', deletedAt: null };
    if (query?.featured !== undefined) filter['featured'] = query.featured;
    return this.findAll(filter as never, {
      page: query?.page,
      limit: query?.limit ?? 50,
      sort: { order: 1, createdAt: -1 },
    });
  }

  async slugExists(slug: string, excludeId?: string) {
    const q: Record<string, unknown> = { slug };
    if (excludeId) q['_id'] = { $ne: excludeId };
    return !!(await Service.exists(q));
  }
}

export const serviceRepository = new ServiceRepository();
