import { Role } from '../../database/models/Role.model';
import { AppError } from '../../shared/AppError';
import { parseQueryOptions } from '../../utils/filterBuilder';
import { ROLE_PERMISSIONS, type Permission } from '../../constants/permissions';
import { Role as RoleEnum } from '../../constants/roles';

export const roleService = {
  async getAllRoles(query: Record<string, unknown>) {
    const { page, limit, sort } = parseQueryOptions(query);
    const [data, total] = await Promise.all([
      Role.find().sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Role.countDocuments(),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  },

  async getRoleById(id: string) {
    const role = await Role.findById(id).lean();
    if (!role) throw AppError.notFound('Role');
    return role;
  },

  async updateRolePermissions(id: string, permissions: Permission[]) {
    const role = await Role.findById(id);
    if (!role) throw AppError.notFound('Role');
    if (role.isSystem && role.name === RoleEnum.SUPER_ADMIN) {
      throw AppError.forbidden('Cannot modify Super Admin permissions');
    }
    role.permissions = permissions;
    await role.save();
    return role;
  },

  async getAvailablePermissions() {
    // Return the full permissions list grouped by module
    const all = Object.values(ROLE_PERMISSIONS).flat();
    const unique = [...new Set(all)];
    const grouped: Record<string, string[]> = {};
    for (const perm of unique) {
      const [module] = perm.split(':');
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push(perm);
    }
    return grouped;
  },
};
