import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10000, // limit each IP to 10000 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size

// Prevent HTTP Param Pollution
app.use(hpp());

app.use(morgan('dev'));

// Uploads static directory
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', version: '2.0.0' });
});

import authRoutes from './routes/auth.routes';
import directorRoutes from './routes/director.routes';
import usersRoutes from './routes/users.routes';
import studentsRoutes from './routes/students.routes';
import teachersRoutes from './routes/teachers.routes';
import coursesRoutes from './routes/courses.routes';
import groupsRoutes from './routes/groups.routes';
import teacherRoutes from './routes/teacher.routes';
import scheduleRoutes from './routes/schedule.routes';
import adminsRoutes from './routes/admins.routes';
import cashiersRoutes from './routes/cashiers.routes';
import directorsRoutes from './routes/directors.routes';
import branchesRoutes from './routes/branches.routes';
import financeRoutes from './routes/finance.routes';
import examsRoutes from './routes/exams.routes';
import roomsRoutes from './routes/rooms.routes';
import auditRoutes from './routes/audit.routes';
import adminDashboardRoutes from './routes/adminDashboard.routes';
import chatRoutes from './routes/chat.routes';
import superAdminRoutes from './routes/superAdmin.routes';

import { authenticateToken } from './middlewares/auth.middleware';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/director', authenticateToken, directorRoutes);

// Protected Routes
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/branches', authenticateToken, branchesRoutes);
app.use('/api/admins', authenticateToken, adminsRoutes);
app.use('/api/cashiers', authenticateToken, cashiersRoutes);
app.use('/api/directors', authenticateToken, directorsRoutes);
app.use('/api/students', authenticateToken, studentsRoutes);
app.use('/api/teachers', authenticateToken, teachersRoutes);
app.use('/api/courses', authenticateToken, coursesRoutes);
app.use('/api/groups', authenticateToken, groupsRoutes);
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/teacher', authenticateToken, teacherRoutes);
app.use('/api/schedule', authenticateToken, scheduleRoutes);
app.use('/api/finance', authenticateToken, financeRoutes);
app.use('/api/exams', authenticateToken, examsRoutes);
app.use('/api/rooms', authenticateToken, roomsRoutes);
app.use('/api/audit', authenticateToken, auditRoutes);
app.use('/api/admin-dashboard', authenticateToken, adminDashboardRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
