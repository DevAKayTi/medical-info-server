import { Brand, IBrand } from '../../database/models/Brand.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class BrandRepository extends BaseRepository<IBrand> {
  constructor() { super(Brand); }

  async findActive(query: { search?: string; category?: string; featured?: boolean; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { status: 'active', deletedAt: null };
    if (query.category) filter['category'] = query.category;
    if (query.featured !== undefined) filter['featured'] = query.featured;
    if (query.search) {
      filter['$or'] = [
        { name: { $regex: query.search, $options: 'i' } },
        { country: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.findAll(filter as never, {
      page: query.page,
      limit: query.limit,
      sort: { featured: -1, name: 1 },
    });
  }

  async slugExists(slug: string, excludeId?: string) {
    const q: Record<string, unknown> = { slug };
    if (excludeId) q['_id'] = { $ne: excludeId };
    return !!(await Brand.exists(q));
  }
}

export const brandRepository = new BrandRepository();
