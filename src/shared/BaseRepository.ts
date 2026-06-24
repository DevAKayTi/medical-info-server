import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { PaginatedResult, PaginationMeta } from '../types/api.types';
import { buildPaginationMeta } from './PaginationHelper';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(
    filter: FilterQuery<T> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
      populate?: string | string[];
      select?: string;
    } = {},
  ): Promise<PaginatedResult<T>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;
    const sort = options.sort ?? { createdAt: -1 };

    const baseFilter = { deletedAt: null, ...filter };

    const [data, total] = await Promise.all([
      this.model
        .find(baseFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(options.populate as string ?? '')
        .select(options.select ?? '')
        .lean<T[]>(),
      this.model.countDocuments(baseFilter),
    ]);

    const meta: PaginationMeta = buildPaginationMeta(total, page, limit);

    return { data: data as T[], meta };
  }

  async findById(id: string, populate?: string | string[]): Promise<T | null> {
    const query = this.model.findOne({ _id: id, deletedAt: null });
    if (populate) query.populate(populate);
    return query.lean<T>() as Promise<T | null>;
  }

  async findOne(filter: FilterQuery<T>, populate?: string): Promise<T | null> {
    const query = this.model.findOne({ ...filter, deletedAt: null });
    if (populate) query.populate(populate);
    return query.lean<T>() as Promise<T | null>;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject() as T;
  }

  async update(
    id: string,
    data: UpdateQuery<T>,
    options: QueryOptions = { new: true, runValidators: true },
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id, deletedAt: null }, data, options)
      .lean<T>() as Promise<T | null>;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.model.updateOne(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
    return result.modifiedCount > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments({ deletedAt: null, ...filter });
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists({ deletedAt: null, ...filter });
    return !!doc;
  }

  async bulkUpdateStatus(
    ids: string[],
    status: string,
    updatedBy?: string,
  ): Promise<number> {
    const result = await this.model.updateMany(
      { _id: { $in: ids }, deletedAt: null },
      { $set: { status, ...(updatedBy && { updatedBy }) } },
    );
    return result.modifiedCount;
  }
}
