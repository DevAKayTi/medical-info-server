import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const categoryController = {
  async getPublicCategories(req: Request, res: Response) {
    const data = await categoryService.getPublicCategories();
    return ApiResponse.success(res, data);
  },
  async getAllCategories(req: Request, res: Response) {
    const result = await categoryService.getAllCategories(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getCategoryById(req: Request, res: Response) {
    const cat = await categoryService.getCategoryById(req.params.id);
    return ApiResponse.success(res, cat);
  },
  async createCategory(req: Request, res: Response) {
    const cat = await categoryService.createCategory(req.body, req.user!.id);
    return ApiResponse.created(res, cat, 'Category created');
  },
  async updateCategory(req: Request, res: Response) {
    const cat = await categoryService.updateCategory(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, cat, 'Category updated');
  },
  async deleteCategory(req: Request, res: Response) {
    await categoryService.deleteCategory(req.params.id);
    return ApiResponse.success(res, null, 'Category deleted');
  },
  async uploadImage(req: Request, res: Response) {
    if (!req.file) return ApiResponse.error(res, 'No image provided', 400);
    const cat = await categoryService.uploadImage(req.params.id, req.file.buffer);
    return ApiResponse.success(res, cat, 'Image uploaded');
  },
};
