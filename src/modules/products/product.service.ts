import { productRepository } from './product.repository';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';
import { generateUniqueSlug } from '../../utils/slugify';
import { parseQueryOptions, buildSearchFilter } from '../../utils/filterBuilder';
import type { CreateProductInput, UpdateProductInput } from '../../validators/product.validator';

export const productService = {
  // Public
  async getPublicProducts(query: Record<string, unknown>) {
    return productRepository.findPublic({
      search: query.search as string,
      category: query.category as string,
      brand: query.brand as string,
      featured: query.featured === 'true' ? true : undefined,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    });
  },

  async getPublicProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw AppError.notFound('Product');
    await productRepository.incrementViewCount((product as { _id: { toString(): string } })._id.toString());
    return product;
  },

  // Admin
  async getAllProducts(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    const searchFilter = buildSearchFilter(query.search as string, ['name', 'sku', 'tags']);
    return productRepository.findAll({ ...filter, ...searchFilter }, {
      page, limit, sort,
      populate: ['category', 'brand'],
    });
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id, ['category', 'brand']);
    if (!product) throw AppError.notFound('Product');
    return product;
  },

  async createProduct(data: CreateProductInput, createdBy: string) {
    const slug = await generateUniqueSlug(data.name, (s) =>
      productRepository.slugExists(s),
    );
    return productRepository.create({ ...data, slug, createdBy } as Record<string, unknown>);
  },

  async updateProduct(id: string, data: UpdateProductInput, updatedBy: string) {
    let slug: string | undefined;
    if (data.name) {
      slug = await generateUniqueSlug(data.name, (s) =>
        productRepository.slugExists(s, id),
      );
    }
    const product = await productRepository.update(id, { ...data, ...(slug && { slug }), updatedBy });
    if (!product) throw AppError.notFound('Product');
    return product;
  },

  async deleteProduct(id: string) {
    const deleted = await productRepository.softDelete(id);
    if (!deleted) throw AppError.notFound('Product');
  },

  async uploadProductImage(id: string, buffer: Buffer, isPrimary = false) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/products');
    const product = await productRepository.update(id, {
      $push: { images: { ...image, isPrimary } },
    } as Record<string, unknown>);
    if (!product) throw AppError.notFound('Product');
    return product;
  },

  async deleteProductImage(id: string, publicId: string) {
    await cloudinaryService.deleteFile(publicId);
    const product = await productRepository.update(id, {
      $pull: { images: { publicId } },
    } as Record<string, unknown>);
    if (!product) throw AppError.notFound('Product');
    return product;
  },

  async bulkUpdateStatus(ids: string[], status: string, updatedBy: string) {
    return productRepository.bulkUpdateStatus(ids, status, updatedBy);
  },
};
