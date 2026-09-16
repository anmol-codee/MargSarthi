/**
 * Environment variable loader with validation.
 * Throws at startup if required variables are missing.
 */

import * as dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '5000'), 10),

  DATABASE_URL: requireEnv('DATABASE_URL'),

  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),

  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),
  API_URL: optionalEnv('API_URL', 'http://localhost:5000'),

  // SMTP — optional; app degrades gracefully if not set
  SMTP_HOST: optionalEnv('SMTP_HOST'),
  SMTP_PORT: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
  SMTP_USER: optionalEnv('SMTP_USER'),
  SMTP_PASSWORD: optionalEnv('SMTP_PASSWORD'),
  SMTP_FROM: optionalEnv('SMTP_FROM', 'noreply@margsarthi.co.in'),

  // Storage
  STORAGE_PROVIDER: optionalEnv('STORAGE_PROVIDER', 'local') as 'local' | 's3',
  STORAGE_ENDPOINT: optionalEnv('STORAGE_ENDPOINT'),
  STORAGE_ACCESS_KEY: optionalEnv('STORAGE_ACCESS_KEY'),
  STORAGE_SECRET_KEY: optionalEnv('STORAGE_SECRET_KEY'),
  STORAGE_BUCKET: optionalEnv('STORAGE_BUCKET', 'margsarthi-docs'),
  STORAGE_REGION: optionalEnv('STORAGE_REGION', 'auto'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),

  get isProduction() {
    return this.NODE_ENV === 'production';
  },
  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },
} as const;
