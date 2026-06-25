import { ProductCategory, IProductCategory } from '../../database/models/ProductCategory.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class CategoryRepository extends BaseRepository<IProductCategory> {
  constructor() { super(ProductCategory); }

  async findActive(query?: { page?: number; limit?: number }) {
    return this.findAll({ status: 'active', deletedAt: null } as never, {
      page: query?.page,
      limit: query?.limit ?? 100,
      sort: { order: 1, name: 1 },
    });
  }

  async findWithProductCounts() {
    return ProductCategory.aggregate([
      { $match: { status: 'active', deletedAt: null } },
      {
        $lookup: {
          from: 'products',
          let: { catId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$category', '$$catId'] }, status: 'active', deletedAt: null } },
            { $count: 'count' },
          ],
          as: 'productStats',
        },
      },
      {
        $project: {
          name: 1, slug: 1, description: 1, image: 1, order: 1,
          productCount: { $ifNull: [{ $arrayElemAt: ['$productStats.count', 0] }, 0] },
        },
      },
      { $sort: { order: 1 } },
    ]);
  }

  async slugExists(slug: string, excludeId?: string) {
    const q: Record<string, unknown> = { slug };
    if (excludeId) q['_id'] = { $ne: excludeId };
    return !!(await ProductCategory.exists(q));
  }
}

export const categoryRepository = new CategoryRepository();
