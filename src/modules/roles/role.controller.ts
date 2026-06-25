import { Request, Response } from 'express';
import { roleService } from './role.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { z } from 'zod';

const updatePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export const roleController = {
  async getAllRoles(req: Request, res: Response) {
    const result = await roleService.getAllRoles(req.query as Record<string, unknown>);
    return ApiResponse.paginated(res, result.data, result.meta);
  },

  async getRoleById(req: Request, res: Response) {
    const role = await roleService.getRoleById(req.params.id);
    return ApiResponse.success(res, role);
  },

  async updateRolePermissions(req: Request, res: Response) {
    const { permissions } = updatePermissionsSchema.parse(req.body);
    const role = await roleService.updateRolePermissions(req.params.id, permissions as never);
    return ApiResponse.success(res, role, 'Permissions updated');
  },

  async getAvailablePermissions(_req: Request, res: Response) {
    const permissions = await roleService.getAvailablePermissions();
    return ApiResponse.success(res, permissions);
  },
};
