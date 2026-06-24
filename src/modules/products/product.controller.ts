import { Request, Response } from 'express';
import { productService } from './product.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const productController = {
  // Public
  async getPublicProducts(req: Request, res: Response) {
    const result = await productService.getPublicProducts(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },

  async getPublicProductBySlug(req: Request, res: Response) {
    const product = await productService.getPublicProductBySlug(req.params.slug);
    return ApiResponse.success(res, product);
  },

  // Admin
  async getAllProducts(req: Request, res: Response) {
    const result = await productService.getAllProducts(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },

  async getProductById(req: Request, res: Response) {
    const product = await productService.getProductById(req.params.id);
    return ApiResponse.success(res, product);
  },

  async createProduct(req: Request, res: Response) {
    const product = await productService.createProduct(req.body, req.user!.id);
    return ApiResponse.created(res, product, 'Product created successfully');
  },

  async updateProduct(req: Request, res: Response) {
    const product = await productService.updateProduct(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, product, 'Product updated successfully');
  },

  async deleteProduct(req: Request, res: Response) {
    await productService.deleteProduct(req.params.id);
    return ApiResponse.success(res, null, 'Product deleted successfully');
  },

  async uploadProductImage(req: Request, res: Response) {
    if (!req.file) {
      return ApiResponse.error(res, 'No image provided', 400);
    }
    const isPrimary = req.body.isPrimary === 'true';
    const product = await productService.uploadProductImage(req.params.id, req.file.buffer, isPrimary);
    return ApiResponse.success(res, product, 'Image uploaded successfully');
  },

  async deleteProductImage(req: Request, res: Response) {
    const product = await productService.deleteProductImage(req.params.id, req.params.publicId);
    return ApiResponse.success(res, product, 'Image removed successfully');
  },

  async bulkUpdateStatus(req: Request, res: Response) {
    const { ids, status } = req.body;
    const count = await productService.bulkUpdateStatus(ids, status, req.user!.id);
    return ApiResponse.success(res, { updated: count }, `${count} products updated`);
  },
};
