import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import { prisma } from './config/database';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(
    `[Server] Running on port ${PORT} in ${env.NODE_ENV} mode`
  );
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('[Server] UNHANDLED REJECTION!');
  logger.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

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
  logger.info('[Server] SIGINT received. Shutting down gracefully');

  server.close(async () => {
    logger.info('[Server] HTTP server closed');

    await prisma.$disconnect();

    logger.info('[Database] Prisma connection closed');

    process.exit(0);
  });
});