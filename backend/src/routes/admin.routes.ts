import { Router } from 'express';
import * as adminCtrl from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// All routes here require ADMIN role
router.use(requireAdmin);

router.get('/dashboard', adminCtrl.getDashboard);
router.get('/students', adminCtrl.getStudents);
router.get('/students/:id', adminCtrl.getStudentDetail);
router.get('/students/:studentId/documents/:documentId/url', adminCtrl.getStudentDocumentUrl);

router.get('/documents', adminCtrl.getDocuments);
router.patch('/documents/:id/verify', adminCtrl.verifyDocument);

export default router;
