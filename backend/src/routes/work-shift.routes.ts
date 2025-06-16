import { Router } from 'express';
import workShiftController from '@/controllers/work-shift.controller';
import { authMiddleware, requireRole } from '@/middleware/auth.middleware';

const router = Router();

// Protected routes
router.use(authMiddleware);

// Attendance tracking
router.post('/check-in-out/:employeeId', workShiftController.checkInOutEmployee);
router.get('/attendance/:employeeId', workShiftController.getEmployeeAttendance);
router.get('/calendar/:employeeId', workShiftController.getEmployeeCalendar);

// Work plans
router.post('/work-plan', workShiftController.createWorkPlan);
router.get('/work-plans/:employeeId', workShiftController.getWorkPlans);
router.put('/work-plan/:id/status', requireRole(1), workShiftController.updateWorkPlanStatus);

// Dashboard
router.get('/dashboard-stats', requireRole(1), workShiftController.getDashboardStats);

export default router;
