import { Router } from 'express';
import contractController from '@/controllers/contract.controller';
import { authMiddleware, requireRole } from '@/middleware/auth.middleware';

const router = Router();

// Protected routes
router.use(authMiddleware);

// Contract routes
router.get('/', contractController.getAllContracts);
router.get('/:id', contractController.getContractById);

// Admin only routes
router.post('/', requireRole(1), contractController.createContract);
router.put('/:id', requireRole(1), contractController.updateContract);
router.delete('/:id', requireRole(1), contractController.deleteContract);

export default router;
