import { Router } from 'express';
import * as leaveApplicationController from '../controllers/leave-application.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/employee', leaveApplicationController.getAllEmployees);
router.get('/', leaveApplicationController.getAllLeaveApplications);
router.get('/:id', leaveApplicationController.getLeaveApplicationById);

// Protected routes
router.post('/', authMiddleware, leaveApplicationController.createLeaveApplication);
router.put('/:id', authMiddleware, leaveApplicationController.updateLeaveApplication);
router.delete('/:id', authMiddleware, leaveApplicationController.deleteLeaveApplication);

export default router;
