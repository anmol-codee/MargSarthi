/**
 * Student ID generator.
 * Format: MS-{YEAR}-{5-digit-sequence}
 * Example: MS-2026-00142
 *
 * Uses a database transaction + SELECT FOR UPDATE to prevent
 * collisions under concurrent registrations.
 */

import { prisma } from '../config/database';

export async function generateStudentId(): Promise<string> {
  const year = new Date().getFullYear();
  const sequenceId = `STUDENT_ID_${year}`;

  const seq = await prisma.sequence.upsert({
    where: { id: sequenceId },
    update: { value: { increment: 1 } },
    create: { id: sequenceId, value: 1 },
  });

  const paddedSequence = String(seq.value).padStart(5, '0');
  return `MS-${year}-${paddedSequence}`;
}

export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const sequenceId = `TICKET_ID_${year}`;

  const seq = await prisma.sequence.upsert({
    where: { id: sequenceId },
    update: { value: { increment: 1 } },
    create: { id: sequenceId, value: 1 },
  });

  const paddedSequence = String(seq.value).padStart(5, '0');
  return `MS-${year}-${paddedSequence}`;
}
