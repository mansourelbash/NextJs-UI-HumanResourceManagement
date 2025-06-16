import { Router } from 'express';
import departmentController from '@/controllers/department.controller';
import { authMiddleware, requireRole } from '@/middleware/auth.middleware';

const router = Router();

// Protected routes
router.use(authMiddleware);

// Department routes
router.get('/', departmentController.getAllDepartments);
router.get('/employee-count', departmentController.getEmployeeCountByDepartment);
router.get('/:id', departmentController.getDepartmentById);

// Admin only routes
router.post('/', requireRole(1), departmentController.createDepartment);
router.put('/:id', requireRole(1), departmentController.updateDepartment);
router.delete('/:id', requireRole(1), departmentController.deleteDepartment);

export default router;
