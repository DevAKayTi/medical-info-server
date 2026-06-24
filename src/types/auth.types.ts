import { Permission } from '../constants/permissions';

export interface JwtPayload {
  sub: string;       // user._id
  email: string;
  role: string;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;       // unique token ID for rotation
  iat?: number;
  exp?: number;
}
