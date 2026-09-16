import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TicketStatus } from '@prisma/client';
import * as ticketService from '../services/ticket.service';
import { success, created, paginated } from '../utils/response';
import { cache, CACHE_KEYS } from '../utils/cache';

const createTicketSchema = z.object({
  categoryId: z.string().uuid(),
  priorityId: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
});

const addMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
  note: z.string().max(2000).optional(),
});

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createTicketSchema.parse(req.body);
    const ticket = await ticketService.createTicket(req.user!.id, {
      ...body,
      attachment: req.file,
    });
    cache.del(CACHE_KEYS.DASHBOARD_STATS);
    created(res, ticket, 'Ticket created successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMyTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const closed = req.query.closed === 'true';

    const { tickets, total } = await ticketService.getStudentTickets(
      req.user!.id, page, limit, closed
    );
    paginated(res, tickets, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const ticket = await ticketService.getTicketById(req.params.id, req.user!.id, isAdmin);
    success(res, ticket);
  } catch (err) {
    next(err);
  }
}

export async function addMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message } = addMessageSchema.parse(req.body);
    const isAdmin = req.user!.role === 'ADMIN';
    const msg = await ticketService.addTicketMessage(
      req.params.id, req.user!.id, isAdmin, message
    );
    created(res, msg, 'Message added');
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, note } = updateStatusSchema.parse(req.body);
    const ticket = await ticketService.updateTicketStatus(req.params.id, req.user!.id, status, note);
    cache.del(CACHE_KEYS.DASHBOARD_STATS);
    success(res, ticket, 'Ticket status updated');
  } catch (err) {
    next(err);
  }
}

export async function getAllTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const closed = req.query.closed === 'true';
    const search = req.query.search as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const priorityId = req.query.priorityId as string | undefined;

    const { tickets, total } = await ticketService.getAllTickets(page, limit, {
      closed,
      search,
      categoryId,
      priorityId,
    });
    paginated(res, tickets, total, page, limit);
  } catch (err) {
    next(err);
  }
}
