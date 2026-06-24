import { Request } from 'express';
import { Permission } from '../constants/permissions';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: Permission[];
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
    }
  }
}

export {};
