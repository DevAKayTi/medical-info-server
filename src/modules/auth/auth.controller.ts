import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../shared/ApiResponse';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return ApiResponse.success(res, { accessToken, user }, 'Login successful');
  },

  async refreshToken(req: Request, res: Response) {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!token) {
      return ApiResponse.error(res, 'Refresh token not provided', 401);
    }
    const { accessToken, refreshToken } = await authService.refreshToken(token);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return ApiResponse.success(res, { accessToken }, 'Token refreshed');
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (token && req.user?.id) {
      await authService.logout(req.user.id, token);
    }
    res.clearCookie('refreshToken');
    return ApiResponse.success(res, null, 'Logged out successfully');
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent');
  },

  async resetPassword(req: Request, res: Response) {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    return ApiResponse.success(res, null, 'Password reset successfully');
  },

  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    return ApiResponse.success(res, null, 'Password changed successfully');
  },

  async getMe(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.id);
    return ApiResponse.success(res, user, 'Profile fetched');
  },

  async updateMe(req: Request, res: Response) {
    const user = await authService.updateProfile(req.user!.id, req.body);
    return ApiResponse.success(res, user, 'Profile updated');
  },
};
