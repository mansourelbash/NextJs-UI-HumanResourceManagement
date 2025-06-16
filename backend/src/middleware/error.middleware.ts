import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types/api.types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = ['Internal server error'];
  let isOperational = false;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = [err.message];
    isOperational = err.isOperational;
  }
  // Handle Prisma errors
  else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = ['Database operation failed'];
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = [err.message];
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = ['Invalid token'];
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = ['Token expired'];
  }

  // Log error if not operational
  if (!isOperational) {
    console.error('ERROR:', err);
  }

  const response: ApiResponse<null> = {
    isSuccess: false,
    message,
    metadata: null,
  };

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
