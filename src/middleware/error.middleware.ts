import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { ErrorCatalog } from '../utils/ErrorCatalog';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    logger.warn(`[ApiError] ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json(ApiResponse.error(err.message, err.errorCode));
  }

  if (err instanceof ZodError) {
    logger.warn(`[ValidationError] - ${err.message}`);
    const errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(ApiResponse.error('Validation failed', ErrorCatalog.VALIDATION_ERROR, errors));
  }

  logger.error(err);

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  return res.status(500).json(ApiResponse.error(message, ErrorCatalog.INTERNAL_ERROR));
};
