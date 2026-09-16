import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { NoticeStatus } from '@prisma/client';
import * as noticeService from '../services/notice.service';
import { success, created, paginated } from '../utils/response';

const createNoticeSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(10000),
  category: z.string().max(50).optional(),
  status: z.nativeEnum(NoticeStatus).optional(),
  publishedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isPinned: z.boolean().optional(),
});

export async function getPublishedNotices(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const { notices, total } = await noticeService.getPublishedNotices(page, limit);
    paginated(res, notices, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getAllNotices(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const { notices, total } = await noticeService.getAllNotices(page, limit);
    paginated(res, notices, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function createNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createNoticeSchema.parse(req.body);
    const notice = await noticeService.createNotice(req.user!.id, {
      ...body,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    created(res, notice, 'Notice created');
  } catch (err) {
    next(err);
  }
}

export async function updateNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createNoticeSchema.partial().parse(req.body);
    const notice = await noticeService.updateNotice(req.params.id, {
      ...body,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    success(res, notice, 'Notice updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteNotice(req: Request, res: Response, next: NextFunction) {
  try {
    await noticeService.deleteNotice(req.params.id);
    success(res, null, 'Notice deleted');
  } catch (err) {
    next(err);
  }
}
