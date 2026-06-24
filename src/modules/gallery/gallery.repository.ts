import { Gallery, IGallery } from '../../database/models/Gallery.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class GalleryRepository extends BaseRepository<IGallery> {
  constructor() { super(Gallery); }

  async findWithFilters(query: { search?: string; category?: string; featured?: boolean; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.category) filter['category'] = query.category;
    if (query.featured !== undefined) filter['featured'] = query.featured;
    if (query.search) {
      filter['$or'] = [
        { title: { $regex: query.search, $options: 'i' } },
        { alt: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.findAll(filter as never, { page: query.page, limit: query.limit, sort: { order: 1, createdAt: -1 } });
  }

  async getCategories() {
    return Gallery.distinct('category', { deletedAt: null });
  }
}

export const galleryRepository = new GalleryRepository();
