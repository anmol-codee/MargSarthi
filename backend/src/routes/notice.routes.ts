import { Router } from 'express';
import * as noticeCtrl from '../controllers/notice.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (for authenticated users)
router.get('/', requireAuth, noticeCtrl.getPublishedNotices);

// Admin routes
router.get('/admin', requireAdmin, noticeCtrl.getAllNotices);
router.post('/', requireAdmin, noticeCtrl.createNotice);
router.put('/:id', requireAdmin, noticeCtrl.updateNotice);
router.delete('/:id', requireAdmin, noticeCtrl.deleteNotice);

export default router;
