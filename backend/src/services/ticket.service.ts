/**
 * Ticket Service — core business logic for the ticketing system.
 */

import { TicketStatus, TicketMessageSender } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateTicketNumber } from '../utils/studentId';
import { emailService } from '../config/email';
import { storage } from '../config/storage';

const ACTIVE_STATUSES = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.WAITING_FOR_STUDENT,
];

const TICKET_SELECT = {
  id: true,
  ticketNumber: true,
  title: true,
  description: true,
  status: true,
  attachmentKey: true,
  attachmentName: true,
  closedAt: true,
  closingNote: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  priority: { select: { id: true, name: true, label: true } },
  student: {
    select: {
      id: true,
      email: true,
      studentProfile: { select: { fullName: true, studentId: true } },
    },
  },
};

export async function createTicket(
  studentUserId: string,
  data: {
    categoryId: string;
    priorityId: string;
    title: string;
    description: string;
    attachment?: Express.Multer.File;
  }
) {
  // Verify category and priority exist
  const [category, priority] = await Promise.all([
    prisma.ticketCategory.findUnique({ where: { id: data.categoryId } }),
    prisma.ticketPriority.findUnique({ where: { id: data.priorityId } }),
  ]);

  if (!category) throw new AppError(404, 'Ticket category not found');
  if (!priority) throw new AppError(404, 'Ticket priority not found');

  let attachmentKey: string | undefined;
  let attachmentName: string | undefined;

  if (data.attachment) {
    const stored = await storage.upload(data.attachment, `tickets/${studentUserId}`);
    attachmentKey = stored.key;
    attachmentName = data.attachment.originalname;
  }

  const ticketNumber = await generateTicketNumber();

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      studentId: studentUserId,
      categoryId: data.categoryId,
      priorityId: data.priorityId,
      title: data.title,
      description: data.description,
      status: TicketStatus.OPEN,
      attachmentKey,
      attachmentName,
    },
    include: {
      category: true,
      priority: true,
      student: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
    },
  });

  // Create initial status history entry
  await prisma.ticketStatusHistory.create({
    data: {
      ticketId: ticket.id,
      changedById: studentUserId,
      fromStatus: TicketStatus.OPEN,
      toStatus: TicketStatus.OPEN,
      note: 'Ticket created',
    },
  });

  // Send email notification (non-blocking)
  emailService
    .sendTicketCreated(
      ticket.student.email,
      ticket.student.studentProfile?.fullName ?? 'Student',
      ticket.ticketNumber,
      ticket.category.name
    )
    .catch(() => {});

  return ticket;
}

export async function getStudentTickets(
  studentUserId: string,
  page = 1,
  limit = 20,
  closed = false
) {
  const skip = (page - 1) * limit;

  const where = {
    studentId: studentUserId,
    deletedAt: null,
    status: closed
      ? { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] as TicketStatus[] }
      : { in: ACTIVE_STATUSES },
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: TICKET_SELECT,
      relationLoadStrategy: 'join',
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return { tickets, total };
}

export async function getTicketById(ticketId: string, requestingUserId: string, isAdmin: boolean) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      deletedAt: null,
      // Students can only see their own tickets
      ...(!isAdmin && { studentId: requestingUserId }),
    },
    select: {
      ...TICKET_SELECT,
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          message: true,
          sender: true,
          createdAt: true,
          user: {
            select: {
              studentProfile: { select: { fullName: true } },
              role: true,
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!ticket) throw new AppError(404, 'Ticket not found');

  let attachmentUrl: string | undefined;
  if (ticket.attachmentKey) {
    attachmentUrl = await storage.getSignedUrl(ticket.attachmentKey);
  }

  return {
    ...ticket,
    attachmentUrl,
  };
}

export async function addTicketMessage(
  ticketId: string,
  senderId: string,
  isAdmin: boolean,
  message: string
) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      deletedAt: null,
      ...(!isAdmin && { studentId: senderId }),
    },
  });

  if (!ticket) throw new AppError(404, 'Ticket not found');
  if (ticket.status === TicketStatus.CLOSED) {
    throw new AppError(400, 'Cannot add message to a closed ticket');
  }

  return prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId,
      sender: isAdmin ? TicketMessageSender.ADMIN : TicketMessageSender.STUDENT,
      message,
    },
  });
}

export async function updateTicketStatus(
  ticketId: string,
  adminId: string,
  newStatus: TicketStatus,
  note?: string
) {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, deletedAt: null },
    include: {
      student: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
    },
  });

  if (!ticket) throw new AppError(404, 'Ticket not found');

  const oldStatus = ticket.status;

  const updated = await prisma.$transaction(async (tx) => {
    const t = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        ...(newStatus === TicketStatus.CLOSED && {
          closedAt: new Date(),
          closedById: adminId,
          closingNote: note,
        }),
      },
    });

    await tx.ticketStatusHistory.create({
      data: {
        ticketId,
        changedById: adminId,
        fromStatus: oldStatus,
        toStatus: newStatus,
        note,
      },
    });

    return t;
  });

  // Email on close
  if (newStatus === TicketStatus.CLOSED) {
    emailService
      .sendTicketClosed(
        ticket.student.email,
        ticket.student.studentProfile?.fullName ?? 'Student',
        ticket.ticketNumber,
        note ?? ''
      )
      .catch(() => {});
  }

  return updated;
}

export async function getAllTickets(
  page = 1,
  limit = 20,
  options: {
    closed?: boolean;
    categoryId?: string;
    priorityId?: string;
    status?: TicketStatus;
    search?: string;
  } = {}
) {
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
    ...(options.closed !== undefined && {
      status: options.closed
        ? { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }
        : { in: ACTIVE_STATUSES },
    }),
    ...(options.categoryId && { categoryId: options.categoryId }),
    ...(options.priorityId && { priorityId: options.priorityId }),
    ...(options.status && { status: options.status }),
    ...(options.search && {
      OR: [
        { ticketNumber: { contains: options.search, mode: 'insensitive' } },
        { title: { contains: options.search, mode: 'insensitive' } },
        {
          student: {
            studentProfile: {
              OR: [
                { fullName: { contains: options.search, mode: 'insensitive' } },
                { studentId: { contains: options.search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    }),
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: TICKET_SELECT,
      relationLoadStrategy: 'join',
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return { tickets, total };
}
