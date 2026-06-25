import { Download, IDownload } from '../../database/models/Download.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class DownloadRepository extends BaseRepository<IDownload> {
  constructor() { super(Download); }

  async findActive(query: { search?: string; category?: string; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { status: 'active', deletedAt: null };
    if (query.category) filter['category'] = query.category;
    if (query.search) {
      filter['$or'] = [
        { title: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.findAll(filter as never, { page: query.page, limit: query.limit, sort: { createdAt: -1 } });
  }

  async incrementDownloadCount(id: string) {
    await Download.updateOne({ _id: id }, { $inc: { downloadCount: 1 } });
  }

  async slugExists(slug: string, excludeId?: string) {
    const q: Record<string, unknown> = { slug };
    if (excludeId) q['_id'] = { $ne: excludeId };
    return !!(await Download.exists(q));
  }
}

export const downloadRepository = new DownloadRepository();
