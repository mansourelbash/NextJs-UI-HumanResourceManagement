import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../server';
import { AppError, asyncHandler } from '@/middleware/error.middleware';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { ApiResponse } from '@/types/api.types';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/faces');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400));
    }
  }
});

class EmployeeController {  // GET /api/v1/employees
  getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100; // Default higher limit for dashboard
    const skip = (page - 1) * limit;

    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: { email: true, role: true }
        },
        department: true,
        position: true
      },
      orderBy: { createdAt: 'desc' }
    });    // Transform data to match frontend expectations
    const transformedEmployees = employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.user?.email || employee.email || '',
      phoneNumber: employee.phoneNumber || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      nationalID: employee.nationalID || '',
      profileImage: employee.avatar || '', // Using avatar from schema
      level: employee.level || '',
      age: employee.age || (employee.dateOfBirth ? 
        Math.floor((Date.now() - new Date(employee.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        undefined),
      tenure: employee.tenure || 0, // Using tenure from schema
      departmentName: employee.department?.name || '',
      positionName: employee.position?.name || '',
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      startDate: employee.createdAt, // Using createdAt as start date
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    }));

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Employees retrieved successfully'],
      metadata: transformedEmployees
    };

    res.status(200).json(response);
  });
  // GET /api/v1/employees/:id
  getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      throw new AppError('Valid employee ID is required', 400);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { email: true, role: true }
        },
        department: true,
        position: true,
        contracts: {
          include: {
            contractSalary: true,
            contractType: true
          }
        }
      }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Employee retrieved successfully'],
      metadata: employee
    };

    res.status(200).json(response);
  });

  // POST /api/v1/employees
  createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employeeData = req.body;

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: employeeData.email,
        password: employeeData.password, // Should be hashed
        role: employeeData.typeContract === 1 ? 'PARTIME' : 'FULLTIME'
      }
    });

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        userId: user.id,
        dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth) : null,
        nationalStartDate: employeeData.nationalStartDate ? new Date(employeeData.nationalStartDate) : null
      },
      include: {
        user: {
          select: { email: true, role: true }
        },
        department: true,
        position: true
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Employee created successfully'],
      metadata: employee
    };

    res.status(201).json(response);
  });

  // PUT /api/v1/employees/:id
  updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        nationalStartDate: updateData.nationalStartDate ? new Date(updateData.nationalStartDate) : undefined
      },
      include: {
        user: {
          select: { email: true, role: true }
        },
        department: true,
        position: true
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Employee updated successfully'],
      metadata: employee
    };

    res.status(200).json(response);
  });

  // DELETE /api/v1/employees/:id
  deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.employee.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse<null> = {
      isSuccess: true,
      message: ['Employee deleted successfully'],
      metadata: null
    };

    res.status(200).json(response);
  });

  // GET /api/v1/employees/get-all-labeled
  getAllLabeledFaces = asyncHandler(async (req: Request, res: Response) => {
    const employees = await prisma.employee.findMany({
      include: {
        faceRegistrations: true
      },
      where: {
        faceRegistrations: {
          some: {}
        }
      }
    });    const labeledData = employees.map((employee: any) => ({
      id: employee.id,
      name: employee.name,
      descriptions: employee.faceRegistrations.map((face: any) => face.descriptor)
    }));

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Labeled faces retrieved successfully'],
      metadata: labeledData
    };

    res.status(200).json(response);
  });

  // GET /api/v1/employees/:id/employee-images
  getEmployeeFaceImages = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const faceRegistrations = await prisma.faceRegistration.findMany({
      where: { employeeId: parseInt(id) },
      orderBy: { statusFaceTurn: 'asc' }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Face images retrieved successfully'],
      metadata: faceRegistrations
    };

    res.status(200).json(response);
  });

  // POST /api/v1/employees/regis-face/:id
  registerFace = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new AppError('No face images provided', 400);
    }

    const faceData = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const statusFaceTurn = req.body[`faceRegises[${i}].statusFaceTurn`];
      const descriptor = req.body[`faceRegises[${i}].descriptor`];

      if (!statusFaceTurn || !descriptor) {
        throw new AppError(`Missing data for face registration ${i}`, 400);
      }

      faceData.push({
        employeeId: parseInt(id),
        url: `/uploads/faces/${file.filename}`,
        statusFaceTurn: parseInt(statusFaceTurn),
        descriptor: descriptor
      });
    }

    await prisma.faceRegistration.createMany({
      data: faceData
    });

    const response: ApiResponse<boolean> = {
      isSuccess: true,
      message: ['Face registration completed successfully'],
      metadata: true
    };

    res.status(201).json(response);
  });

  // PUT /api/v1/employees/update-regis-face/:id
  updateFaceRegistration = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No face images provided', 400);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const faceId = req.body[`faceRegisUpdates[${i}].id`];
      const statusFaceTurn = req.body[`faceRegisUpdates[${i}].statusFaceTurn`];
      const descriptor = req.body[`faceRegisUpdates[${i}].descriptor`];

      if (!faceId || !statusFaceTurn || !descriptor) {
        throw new AppError(`Missing data for face update ${i}`, 400);
      }

      await prisma.faceRegistration.update({
        where: { id: parseInt(faceId) },
        data: {
          url: `/uploads/faces/${file.filename}`,
          statusFaceTurn: parseInt(statusFaceTurn),
          descriptor: descriptor
        }
      });
    }

    const response: ApiResponse<boolean> = {
      isSuccess: true,
      message: ['Face registration updated successfully'],
      metadata: true
    };

    res.status(200).json(response);
  });
}

export default new EmployeeController();
