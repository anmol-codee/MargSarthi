import { Router } from 'express';
import * as appointmentCtrl from '../controllers/appointment.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Public/Student routes
router.get('/slots', requireAuth, appointmentCtrl.getAvailableSlots);
router.post('/book', requireAuth, appointmentCtrl.bookSlot);
router.get('/my-appointments', requireAuth, appointmentCtrl.getMyAppointments);
router.delete('/:id', requireAuth, appointmentCtrl.cancelAppointment);

// Admin routes
router.post('/slots', requireAdmin, appointmentCtrl.createSlot);
router.get('/admin/slots', requireAdmin, appointmentCtrl.getAllSlots);
router.get('/admin/all', requireAdmin, appointmentCtrl.getAdminAppointments);
router.patch('/slots/:id/toggle', requireAdmin, appointmentCtrl.toggleSlot);
router.delete('/slots/:id', requireAdmin, appointmentCtrl.deleteSlot);

export default router;
