import { Router } from 'express';
import * as ticketCtrl from '../controllers/ticket.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { uploadTicketAttachment } from '../middleware/upload';
import { prisma } from '../config/database';
import { success } from '../utils/response';
import { cache, CACHE_KEYS } from '../utils/cache';

const router = Router();

// Categories and priorities (public for ticket form)
router.get('/categories', requireAuth, async (req, res, next) => {
  try {
    let cats = cache.get(CACHE_KEYS.TICKET_CATEGORIES);
    if (!cats) {
      cats = await prisma.ticketCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      cache.set(CACHE_KEYS.TICKET_CATEGORIES, cats, 3600); // 1 hour
    }
    success(res, cats);
  } catch (err) { next(err); }
});

router.get('/priorities', requireAuth, async (req, res, next) => {
  try {
    let priorities = cache.get(CACHE_KEYS.TICKET_PRIORITIES);
    if (!priorities) {
      priorities = await prisma.ticketPriority.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      cache.set(CACHE_KEYS.TICKET_PRIORITIES, priorities, 3600); // 1 hour
    }
    success(res, priorities);
  } catch (err) { next(err); }
});

// Student ticket routes
router.post('/', requireAuth, uploadTicketAttachment.single('attachment'), ticketCtrl.createTicket);
router.get('/', requireAuth, ticketCtrl.getMyTickets);

// Admin-only routes
router.get('/all', requireAdmin, ticketCtrl.getAllTickets);

router.get('/:id', requireAuth, ticketCtrl.getTicket);
router.post('/:id/messages', requireAuth, ticketCtrl.addMessage);

router.patch('/:id/status', requireAdmin, ticketCtrl.updateStatus);

export default router;
