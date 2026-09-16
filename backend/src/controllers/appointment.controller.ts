import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as appointmentService from '../services/appointment.service';
import { success, created, paginated } from '../utils/response';

const createSlotSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(1).max(10).default(1),
  notes: z.string().max(500).optional(),
});

export async function getAvailableSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
    const slots = await appointmentService.getAvailableSlots(fromDate);
    success(res, slots);
  } catch (err) {
    next(err);
  }
}

export async function bookSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const { slotId } = z.object({ slotId: z.string().uuid() }).parse(req.body);
    const appointment = await appointmentService.bookAppointment(req.user!.id, slotId);
    created(res, appointment, 'Appointment booked successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMyAppointments(req: Request, res: Response, next: NextFunction) {
  try {
    const appointments = await appointmentService.getStudentAppointments(req.user!.id);
    success(res, appointments);
  } catch (err) {
    next(err);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await appointmentService.cancelAppointment(req.user!.id, req.params.id);
    success(res, result, 'Appointment cancelled');
  } catch (err) {
    next(err);
  }
}

// Admin
export async function createSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createSlotSchema.parse(req.body);
    const slot = await appointmentService.createSlot({
      ...body,
      date: new Date(body.date),
    });
    created(res, slot, 'Slot created');
  } catch (err) {
    next(err);
  }
}

export async function getAllSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const { slots, total } = await appointmentService.getAllSlots(page, limit);
    paginated(res, slots, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function toggleSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const slot = await appointmentService.toggleSlotActive(req.params.id);
    success(res, slot, 'Slot status toggled');
  } catch (err) {
    next(err);
  }
}

export async function deleteSlot(req: Request, res: Response, next: NextFunction) {
  try {
    await appointmentService.deleteSlot(req.params.id);
    success(res, null, 'Slot deleted');
  } catch (err) {
    next(err);
  }
}

export async function getAdminAppointments(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string | undefined;
    const appointments = await appointmentService.getAdminAppointments(date);
    success(res, appointments);
  } catch (err) {
    next(err);
  }
}
