import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/AppError';
import { Permission } from '../constants/permissions';

export const authorize = (...requiredPermissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    if (requiredPermissions.length === 0) {
      return next();
    }

    const userPermissions = req.user.permissions ?? [];
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      throw AppError.forbidden(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    next();
  };
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw AppError.unauthorized();

    if (!allowedRoles.includes(req.user.role)) {
      throw AppError.forbidden('Your role is not authorized for this action');
    }

    next();
  };
};
