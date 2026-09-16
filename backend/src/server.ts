import cluster from 'cluster';
import os from 'os';
import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import { prisma } from './config/database';

const PORT = env.PORT;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`[Server] Primary cluster ${process.pid} is running`);
  logger.info(`[Server] Setting up ${numCPUs} load balanced workers...`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for dying workers and replace them
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`[Server] Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  const server = app.listen(PORT, () => {
    logger.info(`[Server] Worker ${process.pid} running on port ${PORT} in ${env.NODE_ENV} mode`);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('[Server] UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('[Server] SIGTERM received. Shutting down gracefully');
  server.close(async () => {
    logger.info('[Server] HTTP server closed');
    await prisma.$disconnect();
    logger.info('[Database] Prisma connection closed');
    process.exit(0);
  });
});

  process.on('SIGINT', () => {
    logger.info(`[Server] Worker ${process.pid} SIGINT received. Shutting down gracefully`);
    server.close(async () => {
      logger.info(`[Server] Worker ${process.pid} HTTP server closed`);
      await prisma.$disconnect();
      logger.info(`[Server] Worker ${process.pid} Prisma connection closed`);
      process.exit(0);
    });
  });
}
