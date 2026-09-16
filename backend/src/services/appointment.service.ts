/**
 * Appointment Service — Quick Call booking system.
 * Prevents double-booking via DB unique constraint + transaction.
 */

import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../config/email';

export async function getAvailableSlots(fromDate?: Date) {
  const from = fromDate ?? new Date();
  from.setHours(0, 0, 0, 0);

  const slots = await prisma.appointmentSlot.findMany({
    where: {
      isActive: true,
      date: { gte: from },
    },
    include: {
      _count: {
        select: {
          appointments: {
            where: { status: { not: AppointmentStatus.CANCELLED } },
          },
        },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  // Filter out fully booked slots
  return slots
    .filter((slot) => slot._count.appointments < slot.capacity)
    .map((slot) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      booked: slot._count.appointments,
      available: slot.capacity - slot._count.appointments,
      notes: slot.notes,
    }));
}

export async function bookAppointment(studentUserId: string, slotId: string) {
  const appointment = await prisma.$transaction(async (tx) => {
    const slot = await tx.appointmentSlot.findUnique({
      where: { id: slotId },
      include: {
        _count: {
          select: {
            appointments: {
              where: { status: { not: AppointmentStatus.CANCELLED } },
            },
          },
        },
      },
    });

    if (!slot) throw new AppError(404, 'Appointment slot not found');
    if (!slot.isActive) throw new AppError(400, 'This slot is no longer available');

    // Check if slot is in the past
    const slotDateTime = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(':').map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);
    if (slotDateTime < new Date()) {
      throw new AppError(400, 'Cannot book a past appointment slot');
    }

    // Check capacity
    if (slot._count.appointments >= slot.capacity) {
      throw new AppError(409, 'This slot is fully booked');
    }

    // Check if student already has an appointment for this slot
    const existing = await tx.appointment.findFirst({
      where: {
        slotId,
        studentId: studentUserId,
        status: { not: AppointmentStatus.CANCELLED },
      },
    });

    if (existing) {
      throw new AppError(409, 'You have already booked this slot');
    }

    return tx.appointment.create({
      data: {
        slotId,
        studentId: studentUserId,
        status: AppointmentStatus.CONFIRMED,
      },
      include: {
        slot: true,
        student: {
          select: {
            email: true,
            studentProfile: { select: { fullName: true } },
          },
        },
      },
    });
  }, { isolationLevel: 'Serializable' });

  // Format date for email
  const dateStr = appointment.slot.date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  emailService
    .sendAppointmentConfirmed(
      appointment.student.email,
      appointment.student.studentProfile?.fullName ?? 'Student',
      dateStr,
      appointment.slot.startTime,
      appointment.slot.endTime
    )
    .catch(() => {});

  return appointment;
}

export async function getStudentAppointments(studentUserId: string) {
  return prisma.appointment.findMany({
    where: { studentId: studentUserId },
    include: {
      slot: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function cancelAppointment(studentUserId: string, appointmentId: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, studentId: studentUserId },
    include: { slot: true },
  });

  if (!appointment) throw new AppError(404, 'Appointment not found');

  // Can't cancel past appointments
  const slotDateTime = new Date(appointment.slot.date);
  const [hours, minutes] = appointment.slot.startTime.split(':').map(Number);
  slotDateTime.setHours(hours, minutes, 0, 0);
  if (slotDateTime < new Date()) {
    throw new AppError(400, 'Cannot cancel a past appointment');
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: AppointmentStatus.CANCELLED },
  });
}

// Admin functions
export async function createSlot(data: {
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  notes?: string;
}) {
  return prisma.appointmentSlot.create({ data });
}

export async function getAllSlots(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [slots, total] = await Promise.all([
    prisma.appointmentSlot.findMany({
      include: {
        _count: {
          select: {
            appointments: {
              where: { status: { not: AppointmentStatus.CANCELLED } },
            },
          },
        },
        appointments: {
          include: {
            student: {
              select: { studentProfile: { select: { fullName: true, studentId: true } } },
            },
          },
        },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.appointmentSlot.count(),
  ]);

  return { slots, total };
}

export async function toggleSlotActive(slotId: string) {
  const slot = await prisma.appointmentSlot.findUnique({ where: { id: slotId } });
  if (!slot) throw new AppError(404, 'Slot not found');

  return prisma.appointmentSlot.update({
    where: { id: slotId },
    data: { isActive: !slot.isActive },
  });
}

export async function deleteSlot(slotId: string) {
  const bookings = await prisma.appointment.count({
    where: { slotId, status: AppointmentStatus.CONFIRMED },
  });

  if (bookings > 0) {
    throw new AppError(400, 'Cannot delete a slot with confirmed bookings');
  }

  return prisma.appointmentSlot.delete({ where: { id: slotId } });
}

export async function getAdminAppointments(dateStr?: string) {
  let dateFilter = {};
  if (dateStr) {
    const startOfDay = new Date(dateStr);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setUTCHours(23, 59, 59, 999);
    dateFilter = {
      slot: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    };
  }

  return prisma.appointment.findMany({
    where: dateFilter,
    include: {
      slot: true,
      student: {
        select: {
          phone: true,
          email: true,
          studentProfile: { select: { fullName: true, studentId: true } }
        }
      }
    },
    orderBy: [
      { slot: { date: 'asc' } },
      { slot: { startTime: 'asc' } }
    ]
  });
}
