import { User } from '../../database/models/User.model';
import { Role } from '../../database/models/Role.model';
import { AppError } from '../../shared/AppError';
import { hashPassword } from '../../utils/passwordUtils';
import { parseQueryOptions, buildSearchFilter } from '../../utils/filterBuilder';
import type { CreateUserInput, UpdateUserInput } from '../../validators/user.validator';

export const userService = {
  async getUsers(query: Record<string, unknown>) {
    const { page, limit, sort, filter } = parseQueryOptions(query);
    const searchFilter = buildSearchFilter(query.search as string, ['name', 'email']);
    const baseFilter = { deletedAt: null, ...filter, ...searchFilter };

    const [data, total] = await Promise.all([
      User.find(baseFilter)
        .populate('role', 'name displayName')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(baseFilter),
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

  async getUserById(id: string) {
    const user = await User.findOne({ _id: id, deletedAt: null })
      .populate('role', 'name displayName permissions')
      .lean();
    if (!user) throw AppError.notFound('User');
    return user;
  },

  async createUser(data: CreateUserInput) {
    const exists = await User.exists({ email: data.email, deletedAt: null });
    if (exists) throw AppError.conflict('Email already in use');

    const role = await Role.findById(data.roleId);
    if (!role) throw AppError.badRequest('Invalid role');

    const hashedPassword = await hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.roleId,
      phone: data.phone,
      status: data.status,
    });

    return User.findById(user._id).populate('role', 'name displayName').lean();
  },

  async updateUser(id: string, data: UpdateUserInput) {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.status) updateData.status = data.status;
    if (data.roleId) updateData.role = data.roleId;

    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate('role', 'name displayName');

    if (!user) throw AppError.notFound('User');
    return user;
  },

  async deleteUser(id: string) {
    const result = await User.updateOne({ _id: id, deletedAt: null }, { deletedAt: new Date() });
    if (result.modifiedCount === 0) throw AppError.notFound('User');
  },

  async updateStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { status },
      { new: true },
    ).populate('role', 'name displayName');
    if (!user) throw AppError.notFound('User');
    return user;
  },
};
