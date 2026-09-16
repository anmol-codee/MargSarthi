/**
 * Storage abstraction layer.
 * Supports: local disk (dev) | S3-compatible (prod: AWS S3, Cloudflare R2, Backblaze B2)
 * Switch providers via STORAGE_PROVIDER env var — no code changes needed.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { env } from './env';
import logger from '../utils/logger';

export interface StorageFile {
  key: string;
  url?: string;
}

export interface StorageProvider {
  upload(file: Express.Multer.File, folder: string): Promise<StorageFile>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

// -------------------------------------------------------
// LOCAL STORAGE (development only)
// -------------------------------------------------------
class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, folder: string): Promise<StorageFile> {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;
    const destDir = path.join(this.uploadDir, folder);
    const destPath = path.join(this.uploadDir, key);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(destPath, file.buffer);
    logger.info(`[Storage] Local upload: ${key}`);
    return { key };
  }

  async getSignedUrl(key: string): Promise<string> {
    // In local dev, serve via backend endpoint
    const urlPath = key.split('/').map(encodeURIComponent).join('/');
    return `${env.API_URL}/api/files/${urlPath}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// -------------------------------------------------------
// S3-COMPATIBLE STORAGE (production)
// Uses AWS SDK v3 which works with any S3-compatible provider
// -------------------------------------------------------
class S3StorageProvider implements StorageProvider {
  private s3Client: any;
  private bucket: string;

  constructor() {
    this.bucket = env.STORAGE_BUCKET;
    // Lazy import to avoid loading AWS SDK when not needed
    this.initS3();
  }

  private async initS3() {
    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      this.s3Client = new S3Client({
        region: env.STORAGE_REGION,
        endpoint: env.STORAGE_ENDPOINT || undefined,
        credentials: {
          accessKeyId: env.STORAGE_ACCESS_KEY,
          secretAccessKey: env.STORAGE_SECRET_KEY,
        },
        forcePathStyle: !!env.STORAGE_ENDPOINT, // needed for non-AWS S3-compatible
      });
    } catch (e) {
      logger.error('[Storage] Failed to init S3 client. Install @aws-sdk/client-s3', e);
    }
  }

  async upload(file: Express.Multer.File, folder: string): Promise<StorageFile> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const ext = path.extname(file.originalname);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      })
    );

    logger.info(`[Storage] S3 upload: ${key}`);
    return { key };
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}

// -------------------------------------------------------
// Factory — pick provider from env
// -------------------------------------------------------
function createStorageProvider(): StorageProvider {
  if (env.STORAGE_PROVIDER === 's3') {
    logger.info('[Storage] Using S3-compatible storage provider');
    return new S3StorageProvider();
  }
  logger.info('[Storage] Using local disk storage (development only)');
  return new LocalStorageProvider();
}

export const storage = createStorageProvider();
