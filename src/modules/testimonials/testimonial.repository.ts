import { Testimonial, ITestimonial } from '../../database/models/Testimonial.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class TestimonialRepository extends BaseRepository<ITestimonial> {
  constructor() { super(Testimonial); }

  async findActive(query: { featured?: boolean; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { status: 'active', deletedAt: null };
    if (query.featured !== undefined) filter['featured'] = query.featured;
    return this.findAll(filter as never, { page: query.page, limit: query.limit, sort: { featured: -1, createdAt: -1 } });
  }
}

export const testimonialRepository = new TestimonialRepository();
