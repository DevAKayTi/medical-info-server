import { News, INews } from '../../database/models/News.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class NewsRepository extends BaseRepository<INews> {
  constructor() { super(News); }

  async findPublished(query: { search?: string; category?: string; featured?: boolean; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { status: 'published', deletedAt: null };
    if (query.category) filter['category'] = query.category;
    if (query.featured !== undefined) filter['featured'] = query.featured;
    if (query.search) {
      filter['$or'] = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.findAll(filter as never, {
      page: query.page,
      limit: query.limit,
      sort: { publishedAt: -1 },
      populate: 'author',
    });
  }

  async findBySlug(slug: string) {
    return News.findOne({ slug, status: 'published', deletedAt: null })
      .populate('author', 'name avatar')
      .lean();
  }

  async slugExists(slug: string, excludeId?: string) {
    const q: Record<string, unknown> = { slug };
    if (excludeId) q['_id'] = { $ne: excludeId };
    return !!(await News.exists(q));
  }

  async incrementViewCount(id: string) {
    await News.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
  }
}

export const newsRepository = new NewsRepository();
