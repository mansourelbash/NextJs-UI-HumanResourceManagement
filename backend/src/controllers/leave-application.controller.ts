import { Request, Response } from 'express';
import { prisma } from '../server';

/**
 * Get all leave applications
 */
export const getAllLeaveApplications = async (req: Request, res: Response) => {
  try {
    const leaveApplications = await prisma.leaveApplication.findMany({
      include: {
        employee: true,
      },
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: ['Leave applications retrieved successfully'],
      metadata: leaveApplications,
    });
  } catch (error) {
    console.error('Error retrieving leave applications:', error);
    return res.status(500).json({
      isSuccess: false,
      message: ['Failed to retrieve leave applications'],
      metadata: null,
    });
  }
};

/**
 * Get all employees for leave application
 */
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true, // Using name field instead of fullName
        positionId: true,
        departmentId: true,
        position: true,
        department: true,
      },
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: ['Employees retrieved successfully'],
      metadata: employees,
    });
  } catch (error) {
    console.error('Error retrieving employees for leave applications:', error);
    return res.status(500).json({
      isSuccess: false,
      message: ['Failed to retrieve employees'],
      metadata: null,
    });
  }
};

/**
 * Get leave application by ID
 */
export const getLeaveApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const leaveApplication = await prisma.leaveApplication.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
      },
    });
    
    if (!leaveApplication) {
      return res.status(404).json({
        isSuccess: false,
        message: ['Leave application not found'],
        metadata: null,
      });
    }
    
    return res.status(200).json({
      isSuccess: true,
      message: ['Leave application retrieved successfully'],
      metadata: leaveApplication,
    });
  } catch (error) {
    console.error('Error retrieving leave application:', error);
    return res.status(500).json({
      isSuccess: false,
      message: ['Failed to retrieve leave application'],
      metadata: null,
    });
  }
};

/**
 * Create a new leave application
 */
export const createLeaveApplication = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate, reason, status } = req.body;
    
    const newLeaveApplication = await prisma.leaveApplication.create({
      data: {
        employeeId: Number(employeeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: status || 'pending',
      },
    });
    
    return res.status(201).json({
      isSuccess: true,
      message: ['Leave application created successfully'],
      metadata: true,
    });
  } catch (error) {
    console.error('Error creating leave application:', error);
    return res.status(500).json({
      isSuccess: false,
      message: ['Failed to create leave application'],
      metadata: null,
    });
  }
};

/**
 * Update a leave application
 */
export const updateLeaveApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, startDate, endDate, reason, status } = req.body;
    
    const leaveApplication = await prisma.leaveApplication.findUnique({
      where: { id: Number(id) },
    });
    
    if (!leaveApplication) {
      return res.status(404).json({
        isSuccess: false,
        message: ['Leave application not found'],
        metadata: null,
      });
    }
    
    const updatedLeaveApplication = await prisma.leaveApplication.update({
      where: { id: Number(id) },
      data: {
        employeeId: Number(employeeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status,
      },
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: ['Leave application updated successfully'],
      metadata: true,
    });
  } catch (error) {
    console.error('Error updating leave application:', error);
    return res.status(500).json({
      isSuccess: false,
      message: ['Failed to update leave application'],
      metadata: null,
    });
  }
};

/**
 * Delete a leave application
 */
export const deleteLeaveApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const leaveApplication = await prisma.leaveApplication.findUnique({
      where: { id: Number(id) },
    });
    
    if (!leaveApplication) {
      return res.status(404).json({
        isSuccess: false,
        message: ['Leave application not found'],
        metadata: null,
      });
    }
    
    await prisma.leaveApplication.delete({
      where: { id: Number(id) },
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: ['Leave application deleted successfully'],
      metadata: true,
    });
  } catch (error) {
    console.error('Error deleting leave application:', error);
    return res.status(500).json({
      isSuccess: false,
      message: ['Failed to delete leave application'],
      metadata: null,
    });
  }
};
