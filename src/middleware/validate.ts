import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { AppError } from '../shared/AppError';
import { HTTP_STATUS } from '../constants/httpCodes';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodTypeAny, target: ValidateTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors));
      } else {
        next(err);
      }
    }
  };
};
