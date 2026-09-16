import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import * as studentService from '../services/student.service';
import { success, paginated } from '../utils/response';
import { cache, CACHE_KEYS } from '../utils/cache';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    let stats = cache.get(CACHE_KEYS.DASHBOARD_STATS);
    if (!stats) {
      stats = await adminService.getDashboardStats();
      cache.set(CACHE_KEYS.DASHBOARD_STATS, stats);
    }
    success(res, stats);
  } catch (err) {
    next(err);
  }
}

export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const search = req.query.search as string | undefined;
    const { students, total } = await adminService.getAllStudents(page, limit, search);
    paginated(res, students, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getStudentDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await adminService.getStudentDetail(req.params.id);
    success(res, student);
  } catch (err) {
    next(err);
  }
}

export async function getStudentDocumentUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, documentId } = req.params;
    // Admin accesses any student's document by student's userId
    const result = await studentService.getDocumentUrl(studentId, documentId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    
    const { documents, total } = await adminService.getAllDocuments(page, limit, search, status);
    paginated(res, documents, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function verifyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { isVerified } = req.body;
    const doc = await adminService.verifyDocument(req.params.id, req.user!.id, isVerified);
    success(res, doc, `Document marked as ${isVerified ? 'verified' : 'pending'}`);
  } catch (err) {
    next(err);
  }
}
