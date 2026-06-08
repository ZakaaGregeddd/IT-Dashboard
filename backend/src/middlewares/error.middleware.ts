import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation Error', 400, formattedErrors);
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return sendError(res, 'Unauthorized: Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Unauthorized: Token expired', 401);
  }

  // Handle Prisma Database Errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'field';
      return sendError(res, `Unique constraint failed on ${target}`, 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found in database', 404);
    }
  }

  const message = err.message || 'An unexpected error occurred';
  const status = err.status || 500;
  return sendError(res, message, status);
};
