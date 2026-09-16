/**
 * Winston structured logger.
 * - Development: colorized console output
 * - Production: JSON format for log aggregators
 * NEVER logs passwords, secrets, or sensitive data.
 */

import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: env.isDevelopment ? 'debug' : 'info',
  format: env.isProduction ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

export default logger;
