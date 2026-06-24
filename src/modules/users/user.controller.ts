import { Request, Response } from 'express';
import { userService } from './user.service';
import { ApiResponse } from '../../shared/ApiResponse';

export const userController = {
  async getUsers(req: Request, res: Response) {
    const result = await userService.getUsers(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },
  async getUserById(req: Request, res: Response) {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, user);
  },
  async createUser(req: Request, res: Response) {
    const user = await userService.createUser(req.body);
    return ApiResponse.created(res, user, 'User created');
  },
  async updateUser(req: Request, res: Response) {
    const user = await userService.updateUser(req.params.id, req.body);
    return ApiResponse.success(res, user, 'User updated');
  },
  async deleteUser(req: Request, res: Response) {
    await userService.deleteUser(req.params.id);
    return ApiResponse.success(res, null, 'User deleted');
  },
  async updateStatus(req: Request, res: Response) {
    const user = await userService.updateStatus(req.params.id, req.body.status);
    return ApiResponse.success(res, user, 'User status updated');
  },
};
