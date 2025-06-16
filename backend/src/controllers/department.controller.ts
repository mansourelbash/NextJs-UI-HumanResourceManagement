import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError, asyncHandler } from '@/middleware/error.middleware';
import { ApiResponse } from '@/types/api.types';

class DepartmentController {
  // GET /api/v1/departments
  getAllDepartments = asyncHandler(async (req: Request, res: Response) => {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Departments retrieved successfully'],
      metadata: departments
    };

    res.status(200).json(response);
  });

  // GET /api/v1/departments/employee-count
  getEmployeeCountByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const departmentCounts = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept._count.employees
    }));

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Department employee counts retrieved successfully'],
      metadata: departmentCounts
    };

    res.status(200).json(response);
  });

  // GET /api/v1/departments/:id
  getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        employees: {
          include: {
            user: { select: { email: true } },
            position: true
          }
        }
      }
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Department retrieved successfully'],
      metadata: department
    };

    res.status(200).json(response);
  });

  // POST /api/v1/departments
  createDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name) {
      throw new AppError('Department name is required', 400);
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingDepartment) {
      throw new AppError('Department already exists', 400);
    }

    const department = await prisma.department.create({
      data: {
        name,
        employeeCount: 0
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Department created successfully'],
      metadata: department
    };

    res.status(201).json(response);
  });

  // PUT /api/v1/departments/:id
  updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) }
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { name }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Department updated successfully'],
      metadata: updatedDepartment
    };

    res.status(200).json(response);
  });

  // DELETE /api/v1/departments/:id
  deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { employees: true } } }
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    if (department._count.employees > 0) {
      throw new AppError('Cannot delete department with employees', 400);
    }

    await prisma.department.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Department deleted successfully'],
      metadata: null
    };

    res.status(200).json(response);
  });
}

export default new DepartmentController();
