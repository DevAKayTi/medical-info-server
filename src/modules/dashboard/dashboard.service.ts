import { Product } from '../../database/models/Product.model';
import { News } from '../../database/models/News.model';
import { Inquiry } from '../../database/models/Inquiry.model';
import { Career } from '../../database/models/Career.model';
import { Gallery } from '../../database/models/Gallery.model';
import { User } from '../../database/models/User.model';
import { ActivityLog } from '../../database/models/ActivityLog.model';

export const dashboardService = {
  async getStats() {
    const [products, publishedNews, newInquiries, activeJobs, totalGallery, totalUsers] =
      await Promise.all([
        Product.countDocuments({ status: 'active', deletedAt: null }),
        News.countDocuments({ status: 'published', deletedAt: null }),
        Inquiry.countDocuments({ status: 'new' }),
        Career.countDocuments({ status: 'active', deletedAt: null }),
        Gallery.countDocuments({ deletedAt: null }),
        User.countDocuments({ status: 'active', deletedAt: null }),
      ]);

    return { products, publishedNews, newInquiries, activeJobs, totalGallery, totalUsers };
  },

  async getInquiryTrend(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);

    const results = await Inquiry.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    return results;
  },

  async getProductsByCategory() {
    const results = await Product.aggregate([
      { $match: { status: 'active', deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'productcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$category.name', 'Uncategorized'] },
          count: 1,
          _id: 0,
        },
      },
    ]);
    return results;
  },

  async getRecentActivity(limit = 20) {
    return ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'name avatar')
      .lean();
  },
};
