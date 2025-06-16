import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AppError, asyncHandler } from '@/middleware/error.middleware';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { ApiResponse, LoginRequest, RegisterRequest } from '@/types/api.types';

class AuthController {
  // POST /api/v1/auth/login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user with employee data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: {
          include: {
            department: true,
            position: true
          }
        }
      }
    });    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new AppError('Invalid credentials', 401);
    }    // Generate JWT token
    const jwtPayload = { id: user.id, email: user.email, role: user.role };
    const jwtSecret = process.env.JWT_SECRET!;
    const token = jwt.sign(jwtPayload, jwtSecret, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    } as jwt.SignOptions);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Login successful'],
      metadata: {
        user: {
          id: user.id,
          email: user.email,
          name: user.employee?.name || '',
          role: user.role === 'ADMIN' ? 1 : user.role === 'PARTIME' ? 2 : 3
        },
        token
      }
    };

    res.status(200).json(response);
  });

  // POST /api/v1/auth/register (Admin only)
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role }: RegisterRequest = req.body;

    if (!email || !password || !name || !role) {
      throw new AppError('All fields are required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // Create user and employee
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role === 1 ? 'ADMIN' : role === 2 ? 'PARTIME' : 'FULLTIME',
        employee: {
          create: {
            name,
            email,
            typeContract: role === 2 ? 1 : 2
          }
        }
      },
      include: {
        employee: true
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['User registered successfully'],
      metadata: {
        user: {
          id: user.id,
          email: user.email,
          name: user.employee?.name,
          role: role
        }
      }
    };

    res.status(201).json(response);
  });

  // GET /api/v1/auth/me
  getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        employee: {
          include: {
            department: true,
            position: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['User data retrieved successfully'],
      metadata: {
        id: user.id,
        email: user.email,
        name: user.employee?.name || '',
        role: user.role === 'ADMIN' ? 1 : user.role === 'PARTIME' ? 2 : 3,
        employee: user.employee
      }
    };

    res.status(200).json(response);
  });

  // POST /api/v1/auth/logout
  logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('token');

    const response: ApiResponse<null> = {
      isSuccess: true,
      message: ['Logged out successfully'],
      metadata: null
    };

    res.status(200).json(response);
  });

  // PUT /api/v1/auth/update-account
  updateAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userName, password, email } = req.body;
    const userId = req.user!.id;

    const updateData: any = {};

    if (email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new AppError('Email is already taken', 400);
      }

      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        employee: true
      }
    });

    // Update employee name if userName provided
    if (userName && updatedUser.employee) {
      await prisma.employee.update({
        where: { id: updatedUser.employee.id },
        data: { name: userName }
      });
    }

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Account updated successfully'],
      metadata: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: userName || updatedUser.employee?.name
      }
    };

    res.status(200).json(response);
  });
}

export default new AuthController();
