import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';
import { limiter, authLimiter } from './middleware/rateLimiter';
import { success } from './utils/response';

// Routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import ticketRoutes from './routes/ticket.routes';
import appointmentRoutes from './routes/appointment.routes';
import noticeRoutes from './routes/notice.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS config
app.use(
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
  })
);

// Global rate limiting
app.use(limiter);

// Parse JSON body, but allow raw body for Stripe/Razorpay webhooks if needed
app.use(
  express.json({
    limit: '10kb',
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);

// Parse urlencoded data
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const apiRouter = express.Router();

apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/tickets', ticketRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/notices', noticeRoutes);
apiRouter.use('/admin', adminRoutes);

app.use('/api', apiRouter);

// Serve local uploaded files in development
if (env.STORAGE_PROVIDER !== 's3') {
  app.use('/api/files', express.static(path.join(process.cwd(), 'uploads')));
}

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
