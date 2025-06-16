import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AppError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: number;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });    if (!user) {
      throw new AppError('User not found', 401);
    }

    console.log('User role from database:', user.role, 'Type:', typeof user.role);

    // Handle role conversion based on enum mapping
    let roleNumber: number;
    if (typeof user.role === 'string') {
      switch (user.role) {
        case 'ADMIN':
          roleNumber = 1;
          break;
        case 'PARTIME':
          roleNumber = 2;
          break;
        case 'FULLTIME':
          roleNumber = 3;
          break;
        default:
          roleNumber = 3; // Default to FULLTIME
      }
    } else {
      // If it's already a number, use it directly
      roleNumber = Number(user.role);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: roleNumber
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles: number[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};
