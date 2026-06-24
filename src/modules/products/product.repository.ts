import { Product, IProduct } from '../../database/models/Product.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  async findPublic(query: {
    search?: string;
    category?: string;
    brand?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const filter: Record<string, unknown> = { status: 'active', deletedAt: null };

    if (query.category) filter['category'] = query.category;
    if (query.brand) filter['brand'] = query.brand;
    if (query.featured !== undefined) filter['featured'] = query.featured;
    if (query.search) {
      filter['$or'] = [
        { name: { $regex: query.search, $options: 'i' } },
        { sku: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.findAll(filter, {
      page: query.page,
      limit: query.limit,
      populate: ['category', 'brand'],
      sort: { featured: -1, createdAt: -1 },
    });
  }

  async findBySlug(slug: string) {
    return Product.findOne({ slug, status: 'active', deletedAt: null })
      .populate('category', 'name slug')
      .populate('brand', 'name logo')
      .lean();
  }

  async incrementViewCount(id: string): Promise<void> {
    await Product.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { slug };
    if (excludeId) query['_id'] = { $ne: excludeId };
    return !!(await Product.exists(query));
  }
}

export const productRepository = new ProductRepository();
