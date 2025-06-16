import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import departmentRoutes from './routes/department.routes';
import positionRoutes from './routes/position.routes';
import contractRoutes from './routes/contract.routes';
import attendanceRoutes from './routes/attendance.routes';
import faceRecognitionRoutes from './routes/face-recognition.routes';
import payrollRoutes from './routes/payroll.routes';
import workShiftRoutes from './routes/work-shift.routes';
import leaveApplicationRoutes from './routes/leave-application.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { authMiddleware } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 7025;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

// Global middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(limiter);
app.use(requestLogger);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HRMS API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/face-recognition', faceRecognitionRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/work-shifts', workShiftRoutes);
app.use('/api/v1/leave-applications', leaveApplicationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    isSuccess: false,
    message: ['Route not found'],
    metadata: null,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HRMS API server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
