import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError, asyncHandler } from '@/middleware/error.middleware';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { ApiResponse, AttendanceCheckRequest, WorkPlanRequest } from '@/types/api.types';

class WorkShiftController {
  // POST /api/v1/work-shifts/check-in-out/:employeeId
  checkInOutEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { timeSweep, statusHistory }: AttendanceCheckRequest = req.body;

    if (!timeSweep || !statusHistory) {
      throw new AppError('Time sweep and status history are required', 400);
    }

    // Get employee information
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Create attendance record
    const attendanceRecord = await prisma.attendanceHistory.create({
      data: {
        employeeId: parseInt(employeeId),
        timeSweep: new Date(timeSweep),
        statusHistory: statusHistory === 1 ? 'IN' : 'OUT'
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Attendance recorded successfully'],
      metadata: {
        employeeName: employee.name,
        timeSweep: attendanceRecord.timeSweep.toISOString(),
        status: attendanceRecord.statusHistory
      }
    };

    res.status(201).json(response);
  });

  // GET /api/v1/work-shifts/attendance/:employeeId
  getEmployeeAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const whereCondition: any = {
      employeeId: parseInt(employeeId)
    };

    if (startDate && endDate) {
      whereCondition.timeSweep = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const attendanceRecords = await prisma.attendanceHistory.findMany({
      where: whereCondition,
      include: {
        employee: {
          select: { name: true }
        }
      },
      orderBy: { timeSweep: 'desc' }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Attendance records retrieved successfully'],
      metadata: attendanceRecords
    };

    res.status(200).json(response);
  });

  // GET /api/v1/work-shifts/calendar/:employeeId
  getEmployeeCalendar = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      throw new AppError('Month and year are required', 400);
    }

    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);

    // Get work plans for the employee
    const workPlans = await prisma.workPlan.findMany({
      where: {
        employeeId: parseInt(employeeId),
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        userCalendars: true
      }
    });

    // Get attendance history for the month
    const attendanceHistory = await prisma.attendanceHistory.findMany({
      where: {
        employeeId: parseInt(employeeId),
        timeSweep: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timeSweep: 'asc' }
    });    // Group attendance by date
    const attendanceByDate = attendanceHistory.reduce((acc: any, record: any) => {
      const date = record.timeSweep.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {} as Record<string, typeof attendanceHistory>);

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Calendar data retrieved successfully'],
      metadata: {
        workPlans,
        attendanceByDate
      }
    };

    res.status(200).json(response);
  });

  // POST /api/v1/work-shifts/work-plan
  createWorkPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { timeStart, timeEnd, statusCalendar, dayWorks }: WorkPlanRequest = req.body;
    const employeeId = req.user!.id;

    // Get employee from user
    const employee = await prisma.employee.findUnique({
      where: { userId: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const workPlan = await prisma.workPlan.create({
      data: {
        employeeId: employee.id,
        timeStart,
        timeEnd,
        statusCalendar: statusCalendar === 1 ? 'DRAFT' : 
                       statusCalendar === 2 ? 'SUBMIT' :
                       statusCalendar === 3 ? 'APPROVED' :
                       statusCalendar === 4 ? 'REFUSE' : 'CANCEL',
        userCalendars: dayWorks ? {
          create: dayWorks.map(day => ({
            presentShift: day.presentShift,
            shiftTime: day.shiftTime,
            userCalendarStatus: 'PENDING'
          }))
        } : undefined
      },
      include: {
        userCalendars: true
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Work plan created successfully'],
      metadata: workPlan
    };

    res.status(201).json(response);
  });

  // GET /api/v1/work-shifts/work-plans/:employeeId
  getWorkPlans = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { status } = req.query;

    const whereCondition: any = {
      employeeId: parseInt(employeeId)
    };

    if (status) {
      whereCondition.statusCalendar = status;
    }

    const workPlans = await prisma.workPlan.findMany({
      where: whereCondition,
      include: {
        userCalendars: true,
        employee: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Work plans retrieved successfully'],
      metadata: workPlans
    };

    res.status(200).json(response);
  });

  // PUT /api/v1/work-shifts/work-plan/:id/status
  updateWorkPlanStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { statusCalendar } = req.body;

    const workPlan = await prisma.workPlan.update({
      where: { id: parseInt(id) },
      data: {
        statusCalendar: statusCalendar === 1 ? 'DRAFT' : 
                       statusCalendar === 2 ? 'SUBMIT' :
                       statusCalendar === 3 ? 'APPROVED' :
                       statusCalendar === 4 ? 'REFUSE' : 'CANCEL'
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Work plan status updated successfully'],
      metadata: workPlan
    };

    res.status(200).json(response);
  });

  // GET /api/v1/work-shifts/dashboard-stats
  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get today's attendance count
    const todayAttendance = await prisma.attendanceHistory.count({
      where: {
        timeSweep: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Get total employees
    const totalEmployees = await prisma.employee.count();

    // Get pending work plans
    const pendingWorkPlans = await prisma.workPlan.count({
      where: {
        statusCalendar: 'SUBMIT'
      }
    });

    const response: ApiResponse<any> = {
      isSuccess: true,
      message: ['Dashboard stats retrieved successfully'],
      metadata: {
        todayAttendance,
        totalEmployees,
        pendingWorkPlans,
        attendanceRate: totalEmployees > 0 ? ((todayAttendance / totalEmployees) * 100).toFixed(2) : 0
      }
    };

    res.status(200).json(response);
  });
}

export default new WorkShiftController();
