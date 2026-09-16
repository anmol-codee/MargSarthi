import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as studentService from '../services/student.service';
import { success, created } from '../utils/response';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  casteCategory: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER']).optional(),
  casteSubCategory: z.string().max(100).optional(),
});

const updateEducationSchema = z.object({
  schoolName: z.string().max(200).optional(),
  schoolPassingYear: z.number().int().min(1990).max(2030).optional(),
  collegeName: z.string().max(200).optional(),
  course: z.string().max(100).optional(),
  stream: z.string().max(100).optional(),
  semester: z.string().max(50).optional(),
  session: z.string().max(20).optional(),
  graduationYear: z.number().int().min(1990).max(2035).optional(),
  hasMigration: z.boolean().optional(),
  migrationFrom: z.string().max(200).optional(),
  hasCLC: z.boolean().optional(),
  clcFrom: z.string().max(200).optional(),
  otherDetails: z.string().max(1000).optional(),
});

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await studentService.getStudentProfile(req.user!.id);
    success(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const body = updateProfileSchema.parse(req.body);
    const profile = await studentService.updateStudentProfile(req.user!.id, {
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    });
    success(res, profile, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

export async function getEducation(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await studentService.getStudentProfile(req.user!.id);
    success(res, profile.education ?? null);
  } catch (err) {
    next(err);
  }
}

export async function updateEducation(req: Request, res: Response, next: NextFunction) {
  try {
    const body = updateEducationSchema.parse(req.body);
    const education = await studentService.updateEducation(req.user!.id, body);
    success(res, education, 'Education updated');
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const { documentType } = z
      .object({
        documentType: z.enum([
          'CASTE_CERTIFICATE',
          'MIGRATION_CERTIFICATE',
          'CLC',
          'MARKSHEET',
          'ID_PROOF',
          'ADDRESS_PROOF',
          'PHOTO',
          'OTHER',
        ]),
      })
      .parse(req.body);

    const doc = await studentService.uploadDocument(req.user!.id, req.file, documentType);
    created(res, doc, 'Document uploaded successfully');
  } catch (err) {
    next(err);
  }
}

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await studentService.getStudentProfile(req.user!.id);
    success(res, profile.documents);
  } catch (err) {
    next(err);
  }
}

export async function getDocumentUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentId } = req.params;
    const result = await studentService.getDocumentUrl(req.user!.id, documentId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentId } = req.params;
    await studentService.deleteDocument(req.user!.id, documentId);
    success(res, null, 'Document deleted');
  } catch (err) {
    next(err);
  }
}
