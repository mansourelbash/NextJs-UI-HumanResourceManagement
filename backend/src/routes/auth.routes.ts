import { Router } from 'express';
import authController from '@/controllers/auth.controller';
import { authMiddleware, requireRole } from '@/middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/admin-login', authController.login); // Admin login route
router.post('/employee-login', authController.login); // Employee login route
router.post('/logout', authController.logout);
router.delete('/log-out', authController.logout); // Alternative logout route

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.get('/get-current-user', authMiddleware, authController.getCurrentUser); // Alternative route name
router.put('/update-account', authMiddleware, authController.updateAccount);
router.put('/update-account/:id', authMiddleware, authController.updateAccount); // Route with ID param

// Admin only routes
router.post('/register', authMiddleware, requireRole(1), authController.register);

export default router;
