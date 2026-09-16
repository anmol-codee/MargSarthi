/**
 * Student Profile Service
 */

import { CasteCategory } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { storage } from '../config/storage';

export async function getStudentProfile(userId: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { userId },
    include: {
      education: true,
      documents: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!profile) throw new AppError(404, 'Student profile not found');
  return profile;
}

export async function updateStudentProfile(
  userId: string,
  data: {
    fullName?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    casteCategory?: CasteCategory;
    casteSubCategory?: string;
  }
) {
  const profile = await prisma.studentProfile.findFirst({ where: { userId } });
  if (!profile) throw new AppError(404, 'Student profile not found');

  const updated = await prisma.studentProfile.update({
    where: { userId },
    data: {
      ...data,
      completionPercent: calculateCompletion({ ...profile, ...data }),
    },
  });

  return updated;
}

export async function updateEducation(
  userId: string,
  data: {
    schoolName?: string;
    schoolPassingYear?: number;
    collegeName?: string;
    course?: string;
    stream?: string;
    semester?: string;
    session?: string;
    graduationYear?: number;
    hasMigration?: boolean;
    migrationFrom?: string;
    hasCLC?: boolean;
    clcFrom?: string;
    otherDetails?: string;
  }
) {
  const profile = await prisma.studentProfile.findFirst({ where: { userId } });
  if (!profile) throw new AppError(404, 'Student profile not found');

  const education = await prisma.education.upsert({
    where: { studentProfileId: profile.id },
    create: { studentProfileId: profile.id, ...data },
    update: data,
  });

  // Update completion percent
  await recalculateCompletion(userId);

  return education;
}

export async function uploadDocument(
  userId: string,
  file: Express.Multer.File,
  documentType: string
) {
  const profile = await prisma.studentProfile.findFirst({ where: { userId } });
  if (!profile) throw new AppError(404, 'Student profile not found');

  const stored = await storage.upload(file, `documents/${profile.id}`);

  const doc = await prisma.document.create({
    data: {
      studentProfileId: profile.id,
      documentType: documentType as any,
      originalFilename: file.originalname,
      storageKey: stored.key,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
    },
  });

  await recalculateCompletion(userId);

  return doc;
}

export async function getDocumentUrl(userId: string, documentId: string) {
  const profile = await prisma.studentProfile.findFirst({ where: { userId } });
  if (!profile) throw new AppError(404, 'Student profile not found');

  const doc = await prisma.document.findFirst({
    where: { id: documentId, studentProfileId: profile.id, deletedAt: null },
  });

  if (!doc) throw new AppError(404, 'Document not found');

  const url = await storage.getSignedUrl(doc.storageKey, 3600);
  return { url, document: doc };
}

export async function deleteDocument(userId: string, documentId: string) {
  const profile = await prisma.studentProfile.findFirst({ where: { userId } });
  if (!profile) throw new AppError(404, 'Student profile not found');

  const doc = await prisma.document.findFirst({
    where: { id: documentId, studentProfileId: profile.id, deletedAt: null },
  });

  if (!doc) throw new AppError(404, 'Document not found');

  // Soft delete
  await prisma.document.update({
    where: { id: documentId },
    data: { deletedAt: new Date() },
  });
}

function calculateCompletion(profile: any): number {
  const fields = [
    profile.fullName,
    profile.dateOfBirth,
    profile.gender,
    profile.address,
    profile.city,
    profile.state,
    profile.pincode,
    profile.casteCategory,
  ];

  const filledFields = fields.filter(Boolean).length;
  return Math.round((filledFields / fields.length) * 100);
}

async function recalculateCompletion(userId: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { userId },
    include: { education: true, documents: { where: { deletedAt: null } } },
  });

  if (!profile) return;

  const personalFields = [
    profile.fullName,
    profile.dateOfBirth,
    profile.gender,
    profile.address,
    profile.city,
    profile.state,
    profile.pincode,
    profile.casteCategory,
  ];

  const personalFilled = personalFields.filter(Boolean).length;
  const personalScore = (personalFilled / personalFields.length) * 60; // 60% weight

  const educationScore = profile.education ? 25 : 0; // 25% weight

  const documentScore = profile.documents.length > 0 ? 15 : 0; // 15% weight

  const total = Math.round(personalScore + educationScore + documentScore);

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { completionPercent: total },
  });
}

// Admin: get student profile with full details
export async function getStudentProfileForAdmin(studentProfileId: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { id: studentProfileId },
    include: {
      user: {
        select: { email: true, phone: true, lastLoginAt: true, createdAt: true, isActive: true },
      },
      education: true,
      documents: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!profile) throw new AppError(404, 'Student profile not found');
  return profile;
}
