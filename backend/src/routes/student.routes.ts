import { Router } from 'express';
import * as studentCtrl from '../controllers/student.controller';
import { requireStudent } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require student auth
router.use(requireStudent);

router.get('/profile', studentCtrl.getProfile);
router.put('/profile', studentCtrl.updateProfile);

router.get('/education', studentCtrl.getEducation);
router.put('/education', studentCtrl.updateEducation);

router.get('/documents', studentCtrl.getDocuments);
router.post('/documents', upload.single('file'), studentCtrl.uploadDocument);
router.get('/documents/:documentId/url', studentCtrl.getDocumentUrl);
router.delete('/documents/:documentId', studentCtrl.deleteDocument);

export default router;
