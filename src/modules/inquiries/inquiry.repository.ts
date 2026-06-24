import { Inquiry, IInquiry } from '../../database/models/Inquiry.model';
import { BaseRepository } from '../../shared/BaseRepository';

export class InquiryRepository extends BaseRepository<IInquiry> {
  constructor() { super(Inquiry); }

  async findWithFilters(query: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter['status'] = query.status;
    if (query.search) {
      filter['$or'] = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { company: { $regex: query.search, $options: 'i' } },
        { subject: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.findAll(filter as never, {
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      populate: 'assignedTo',
    });
  }

  async countByStatus(): Promise<Record<string, number>> {
    const results = await Inquiry.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return results.reduce((acc: Record<string, number>, r: { _id: string; count: number }) => {
      acc[r._id] = r.count;
      return acc;
    }, {});
  }

  async getRecentTrend(days = 30): Promise<{ date: string; count: number }[]> {
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
    ]);
    return results.map((r: { _id: string; count: number }) => ({ date: r._id, count: r.count }));
  }
}

export const inquiryRepository = new InquiryRepository();
