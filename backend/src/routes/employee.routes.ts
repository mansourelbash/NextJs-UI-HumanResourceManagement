import { Router } from 'express';
import employeeController, { upload } from '@/controllers/employee.controller';
import { authMiddleware, requireRole } from '@/middleware/auth.middleware';

const router = Router();

// Public routes (for face recognition)
router.get('/get-all-labeled', employeeController.getAllLabeledFaces);

// Protected routes
router.use(authMiddleware);

// Employee routes
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.get('/:id/employee-images', employeeController.getEmployeeFaceImages);

// Face registration routes
router.post('/regis-face/:id', 
  upload.array('faceFile', 5), 
  employeeController.registerFace
);
router.put('/update-regis-face/:id', 
  upload.array('faceFile', 5), 
  employeeController.updateFaceRegistration
);

// Admin only routes
router.post('/', requireRole(1), employeeController.createEmployee);
router.put('/:id', requireRole(1), employeeController.updateEmployee);
router.delete('/:id', requireRole(1), employeeController.deleteEmployee);

export default router;
