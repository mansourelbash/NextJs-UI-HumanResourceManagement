import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError, asyncHandler } from '@/middleware/error.middleware';
import { ApiResponse } from '@/types/api.types';

class ContractController {
  // GET /api/v1/contracts
  getAllContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await prisma.contract.findMany({
      include: {
        employee: {
          include: {
            user: { select: { email: true } },
            department: true,
            position: true
          }
        },
        contractSalary: true,
        contractType: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match frontend expectations
    const transformedContracts = contracts.map(contract => ({
      id: contract.id,
      employeeId: contract.employeeId,
      contractSalaryId: contract.contractSalaryId,
      contractTypeId: contract.contractTypeId,
      startDate: contract.startDate,
      endDate: contract.endDate,
      name: contract.employee?.name || '',
      dateOfBirth: contract.employee?.dateOfBirth,
      gender: contract.employee?.gender || false,
      address: contract.employee?.address || '',
      countrySide: contract.employee?.countrySide || '',
      nationalID: contract.employee?.nationalID || '',
      positionId: contract.employee?.positionId || 0,
      contractStatus: contract.contractStatus,
      typeContract: contract.typeContract,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      // Additional fields from related models
      departmentName: contract.employee?.department?.name || '',
      positionName: contract.employee?.position?.name || '',
      contractTypeName: contract.contractType?.name || '',
      baseSalary: contract.contractSalary?.baseSalary || 0
    }));

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Contracts retrieved successfully'],
      metadata: transformedContracts
    };

    res.status(200).json(response);
  });

  // GET /api/v1/contracts/:id
  getContractById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee: {
          include: {
            user: { select: { email: true } },
            department: true,
            position: true
          }
        },
        contractSalary: true,
        contractType: true
      }
    });

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Contract retrieved successfully'],
      metadata: contract
    };

    res.status(200).json(response);
  });

  // POST /api/v1/contracts
  createContract = asyncHandler(async (req: Request, res: Response) => {
    const {
      employeeId,
      contractSalaryId,
      contractTypeId,
      startDate,
      endDate,
      contractStatus,
      typeContract
    } = req.body;

    // Validate required fields
    if (!employeeId || !contractSalaryId || !contractTypeId || !startDate) {
      throw new AppError('Missing required fields', 400);
    }    // Check if employee exists and get department/position
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        position: true
      }
    });    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (!employee.departmentId || !employee.positionId) {
      throw new AppError('Employee must have a department and position to create a contract', 400);
    }

    const contract = await prisma.contract.create({
      data: {
        employeeId,
        contractSalaryId,
        contractTypeId,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        contractStatus: contractStatus || 1,
        typeContract: typeContract || 1
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true
          }
        },
        contractSalary: true,
        contractType: true
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Contract created successfully'],
      metadata: contract
    };

    res.status(201).json(response);
  });

  // PUT /api/v1/contracts/:id
  updateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      contractSalaryId,
      contractTypeId,
      startDate,
      endDate,
      contractStatus,
      typeContract
    } = req.body;

    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(id) }
    });

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    const updatedContract = await prisma.contract.update({
      where: { id: parseInt(id) },
      data: {
        ...(contractSalaryId && { contractSalaryId }),
        ...(contractTypeId && { contractTypeId }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(contractStatus !== undefined && { contractStatus }),
        ...(typeContract !== undefined && { typeContract })
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true
          }
        },
        contractSalary: true,
        contractType: true
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Contract updated successfully'],
      metadata: updatedContract
    };

    res.status(200).json(response);
  });

  // DELETE /api/v1/contracts/:id
  deleteContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(id) }
    });

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    await prisma.contract.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Contract deleted successfully'],
      metadata: null
    };

    res.status(200).json(response);
  });
}

export default new ContractController();
