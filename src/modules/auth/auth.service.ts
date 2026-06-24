import { User } from '../../database/models/User.model';
import { Role } from '../../database/models/Role.model';
import { AppError } from '../../shared/AppError';
import { comparePassword, hashPassword } from '../../utils/passwordUtils';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashToken,
  verifyRefreshToken,
} from '../../utils/tokenUtils';
import { emailService } from '../../services/email.service';
import { env } from '../../config/env';
import { Permission } from '../../constants/permissions';

export const authService = {
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }> {
    const user = await User.findOne({ email, deletedAt: null, status: 'active' })
      .select('+password +refreshTokens')
      .populate<{ role: { name: string; permissions: Permission[] } }>('role', 'name permissions');

    if (!user) throw AppError.unauthorized('Invalid email or password');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw AppError.unauthorized('Invalid email or password');

    const roleData = user.role as unknown as { name: string; permissions: Permission[] };

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: roleData.name,
      permissions: roleData.permissions,
    });

    const { token: refreshToken } = generateRefreshToken(user._id.toString());
    const hashedRefresh = hashToken(refreshToken);

    await User.updateOne(
      { _id: user._id },
      {
        $push: { refreshTokens: hashedRefresh },
        lastLogin: new Date(),
      },
    );

    const { password: _, refreshTokens: __, ...userObj } = user.toObject();

    return { accessToken, refreshToken, user: userObj };
  },

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      _id: payload.sub,
      refreshTokens: hashedToken,
      deletedAt: null,
      status: 'active',
    })
      .select('+refreshTokens')
      .populate<{ role: { name: string; permissions: Permission[] } }>('role', 'name permissions');

    if (!user) throw AppError.unauthorized('Invalid refresh token');

    const roleData = user.role as unknown as { name: string; permissions: Permission[] };

    // Rotate: remove old, add new
    const { token: newRefreshToken } = generateRefreshToken(user._id.toString());
    const newHashedRefresh = hashToken(newRefreshToken);

    await User.updateOne(
      { _id: user._id },
      {
        $pull: { refreshTokens: hashedToken },
        $push: { refreshTokens: newHashedRefresh },
      },
    );

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: roleData.name,
      permissions: roleData.permissions,
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string, token: string): Promise<void> {
    const hashedToken = hashToken(token);
    await User.updateOne({ _id: userId }, { $pull: { refreshTokens: hashedToken } });
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) return; // Silent — don't reveal existence

    const { token, hashedToken, expiresAt } = generateResetToken();

    await User.updateOne(
      { _id: user._id },
      { passwordResetToken: hashedToken, passwordResetExpires: expiresAt },
    );

    const resetUrl = `${env.ADMIN_URL}/reset-password/${token}`;
    await emailService.sendPasswordReset(user.email, user.name, resetUrl);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      deletedAt: null,
    }).select('+refreshTokens');

    if (!user) throw AppError.badRequest('Reset token is invalid or has expired');

    const hashedPassword = await hashPassword(newPassword);

    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        refreshTokens: [], // Invalidate all sessions
        passwordChangedAt: new Date(),
      },
    );
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw AppError.notFound('User');

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw AppError.badRequest('Current password is incorrect');

    const hashedPassword = await hashPassword(newPassword);
    await User.updateOne(
      { _id: userId },
      { password: hashedPassword, passwordChangedAt: new Date() },
    );
  },

  async getMe(userId: string) {
    const user = await User.findOne({ _id: userId, deletedAt: null })
      .populate('role', 'name displayName permissions')
      .lean();
    if (!user) throw AppError.notFound('User');
    return user;
  },

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string },
  ) {
    const user = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('role', 'name displayName');
    if (!user) throw AppError.notFound('User');
    return user;
  },
};
