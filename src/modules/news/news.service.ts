import { newsRepository } from './news.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions, buildSearchFilter } from '../../utils/filterBuilder';

export const newsService = {
  async getPublicNews(query: Record<string, unknown>) {
    return newsRepository.findPublished({
      search: query.search as string,
      category: query.category as string,
      featured: query.featured === 'true' ? true : undefined,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 10),
    });
  },

  async getPublicNewsBySlug(slug: string) {
    const article = await newsRepository.findBySlug(slug);
    if (!article) throw AppError.notFound('Article');
    await newsRepository.incrementViewCount((article as { _id: { toString(): string } })._id.toString());
    return article;
  },

  async getAllNews(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    const searchFilter = buildSearchFilter(query.search as string, ['title', 'excerpt', 'tags']);
    return newsRepository.findAll({ ...filter, ...searchFilter } as never, { page, limit, sort, populate: 'author' });
  },

  async getNewsById(id: string) {
    const article = await newsRepository.findById(id, 'author');
    if (!article) throw AppError.notFound('Article');
    return article;
  },

  async createNews(data: Record<string, unknown>, authorId: string) {
    const slug = await generateUniqueSlug(String(data.name ?? data.title), (s) => newsRepository.slugExists(s));
    return newsRepository.create({ ...data, slug, author: authorId, createdBy: authorId } as never);
  },

  async updateNews(id: string, data: Record<string, unknown>, updatedBy: string) {
    let slug: string | undefined;
    if (data.title) slug = await generateUniqueSlug(String(data.title), (s) => newsRepository.slugExists(s, id));
    const article = await newsRepository.update(id, { ...data, ...(slug && { slug }), updatedBy } as never);
    if (!article) throw AppError.notFound('Article');
    return article;
  },

  async publishNews(id: string, updatedBy: string) {
    const article = await newsRepository.update(id, { status: 'published', publishedAt: new Date(), updatedBy } as never);
    if (!article) throw AppError.notFound('Article');
    return article;
  },

  async unpublishNews(id: string, updatedBy: string) {
    const article = await newsRepository.update(id, { status: 'draft', publishedAt: null, updatedBy } as never);
    if (!article) throw AppError.notFound('Article');
    return article;
  },

  async deleteNews(id: string) {
    const deleted = await newsRepository.softDelete(id);
    if (!deleted) throw AppError.notFound('Article');
  },

  async uploadCoverImage(id: string, buffer: Buffer) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/news');
    const article = await newsRepository.update(id, { coverImage: { url: image.url, publicId: image.publicId } } as never);
    if (!article) throw AppError.notFound('Article');
    return article;
  },
};
