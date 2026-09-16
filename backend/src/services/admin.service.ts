/**
 * Admin Dashboard Service
 */

import { prisma } from '../config/database';
import { TicketStatus, AppointmentStatus, Role } from '@prisma/client';

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [
    totalStudents,
    ticketStats,
    todayAppointments,
    recentTickets,
    recentStudents,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT, deletedAt: null, isActive: true } }),
    prisma.ticket.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { deletedAt: null },
    }),
    prisma.appointment.count({
      where: {
        status: AppointmentStatus.CONFIRMED,
        slot: { date: { gte: today, lt: tomorrow } },
      },
    }),
    prisma.ticket.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      relationLoadStrategy: 'join',
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        createdAt: true,
        category: { select: { name: true } },
        priority: { select: { label: true } },
        student: { select: { studentProfile: { select: { fullName: true } } } },
      },
    }),
    prisma.studentProfile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        studentId: true,
        fullName: true,
        createdAt: true,
        userId: true,
      },
    }),
  ]);

  const getCount = (status: TicketStatus) => 
    ticketStats.find(s => s.status === status)?._count.status || 0;

  const openTickets = getCount(TicketStatus.OPEN);
  const inProgressTickets = getCount(TicketStatus.IN_PROGRESS);

  return {
    students: {
      total: totalStudents,
    },
    tickets: {
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: getCount(TicketStatus.RESOLVED),
      closed: getCount(TicketStatus.CLOSED),
      active: openTickets + inProgressTickets,
    },
    appointments: {
      today: todayAppointments,
    },
    recent: {
      tickets: recentTickets,
      students: recentStudents,
    },
  };
}

export async function getAllStudents(
  page = 1,
  limit = 20,
  search?: string
) {
  const skip = (page - 1) * limit;

  const where: any = {
    role: Role.STUDENT,
    deletedAt: null,
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        {
          studentProfile: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { studentId: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ],
    }),
  };

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        studentProfile: {
          select: {
            studentId: true,
            fullName: true,
            city: true,
            state: true,
            completionPercent: true,
          },
        },
        _count: { select: { ticketsRaised: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { students, total };
}

export async function getStudentDetail(userId: string) {
  const student = await prisma.user.findFirst({
    where: { id: userId, role: Role.STUDENT },
    select: {
      id: true,
      email: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      studentProfile: {
        include: {
          education: true,
          documents: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        },
      },
      ticketsRaised: {
        where: { deletedAt: null },
        include: {
          category: true,
          priority: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      appointments: {
        include: { slot: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  return student;
}

export async function getAllDocuments(page = 1, limit = 20, search?: string, status?: string) {
  const skip = (page - 1) * limit;

  const where: any = { deletedAt: null };

  if (status === 'VERIFIED') where.isVerified = true;
  if (status === 'PENDING') where.isVerified = false;

  if (search) {
    where.studentProfile = {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    };
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        studentProfile: {
          select: {
            fullName: true,
            user: { select: { email: true, id: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  // Map the output to match frontend expectations (doc.studentId, doc.student.email)
  const mappedDocs = documents.map(doc => ({
    ...doc,
    studentId: doc.studentProfile?.user?.id,
    student: {
      email: doc.studentProfile?.user?.email,
      studentProfile: { fullName: doc.studentProfile?.fullName }
    }
  }));

  return { documents: mappedDocs, total };
}

export async function verifyDocument(documentId: string, adminId: string, isVerified: boolean) {
  return prisma.document.update({
    where: { id: documentId },
    data: {
      isVerified,
      verifiedBy: isVerified ? adminId : null,
      verifiedAt: isVerified ? new Date() : null,
    },
  });
}
