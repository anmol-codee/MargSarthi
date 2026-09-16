/**
 * Notice Service
 */

import { NoticeStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Public — only published, non-expired notices
export async function getPublishedNotices(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {
    status: NoticeStatus.PUBLISHED,
    publishedAt: { lte: now },
    deletedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        publishedAt: true,
        expiresAt: true,
        isPinned: true,
        createdAt: true,
        author: { select: { studentProfile: { select: { fullName: true } } } },
      },
    }),
    prisma.notice.count({ where }),
  ]);

  return { notices, total };
}

// Admin — all notices
export async function getAllNotices(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notice.count({ where: { deletedAt: null } }),
  ]);

  return { notices, total };
}

export async function createNotice(
  adminId: string,
  data: {
    title: string;
    content: string;
    category?: string;
    status?: NoticeStatus;
    publishedAt?: Date;
    expiresAt?: Date;
    isPinned?: boolean;
  }
) {
  return prisma.notice.create({
    data: {
      ...data,
      authorId: adminId,
      publishedAt: data.status === NoticeStatus.PUBLISHED ? (data.publishedAt ?? new Date()) : data.publishedAt,
    },
  });
}

export async function updateNotice(
  noticeId: string,
  data: {
    title?: string;
    content?: string;
    category?: string;
    status?: NoticeStatus;
    publishedAt?: Date;
    expiresAt?: Date;
    isPinned?: boolean;
  }
) {
  const notice = await prisma.notice.findFirst({ where: { id: noticeId, deletedAt: null } });
  if (!notice) throw new AppError(404, 'Notice not found');

  return prisma.notice.update({
    where: { id: noticeId },
    data: {
      ...data,
      // Auto-set publishedAt when publishing
      ...(data.status === NoticeStatus.PUBLISHED && !notice.publishedAt && {
        publishedAt: new Date(),
      }),
    },
  });
}

export async function deleteNotice(noticeId: string) {
  const notice = await prisma.notice.findFirst({ where: { id: noticeId, deletedAt: null } });
  if (!notice) throw new AppError(404, 'Notice not found');

  return prisma.notice.update({
    where: { id: noticeId },
    data: { deletedAt: new Date(), status: NoticeStatus.ARCHIVED },
  });
}
