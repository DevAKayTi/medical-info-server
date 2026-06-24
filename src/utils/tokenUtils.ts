import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { JwtPayload, RefreshTokenPayload, TokenPair } from '../types/auth.types';
import { Permission } from '../constants/permissions';

export const generateAccessToken = (payload: {
  id: string;
  email: string;
  role: string;
  permissions: Permission[];
}): string => {
  const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: payload.id,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions,
  };
  return jwt.sign(jwtPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (userId: string): { token: string; jti: string } => {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: userId, jti } as RefreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
  return { token, jti };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateResetToken = (): { token: string; hashedToken: string; expiresAt: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return { token, hashedToken, expiresAt };
};
