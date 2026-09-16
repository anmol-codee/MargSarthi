/**
 * Authentication Service
 * Handles registration, login, token generation, and password management.
 */

import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { emailService } from '../config/email';
import { generateStudentId } from '../utils/studentId';
import { AppError } from '../middleware/errorHandler';

export interface RegisterDto {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export function generateTokens(userId: string, role: Role) {
  const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

export async function registerStudent(dto: RegisterDto) {
  // Check for duplicate email
  const existingEmail = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existingEmail) {
    throw new AppError(409, 'An account with this email already exists');
  }

  // Check for duplicate phone
  const existingPhone = await prisma.user.findUnique({ where: { phone: dto.phone } });
  if (existingPhone) {
    throw new AppError(409, 'An account with this phone number already exists');
  }

  const passwordHash = await argon2.hash(dto.password);

  // Generate student ID before creating user (in a transaction)
  const studentIdValue = await generateStudentId();

  const user = await prisma.user.create({
    data: {
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          fullName: dto.fullName,
          studentId: studentIdValue,
          completionPercent: 20, // basic profile starts at 20%
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  // Send welcome email (non-blocking)
  emailService.sendWelcome(user.email, dto.fullName, studentIdValue).catch(() => {});

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentProfile?.studentId,
      fullName: dto.fullName,
    },
  };
}

export async function loginUser(dto: LoginDto) {
  const user = await prisma.user.findFirst({
    where: {
      email: dto.email,
      deletedAt: null,
    },
    include: {
      studentProfile: {
        select: { studentId: true, fullName: true, completionPercent: true },
      },
    },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new AppError(401, 'Account has been deactivated. Please contact support.');
  }

  const validPassword = await argon2.verify(user.passwordHash, dto.password);
  if (!validPassword) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentProfile?.studentId ?? null,
      fullName: user.studentProfile?.fullName ?? null,
      completionPercent: user.studentProfile?.completionPercent ?? null,
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, isActive: true, deletedAt: null },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError(401, 'User not found');
  }

  const tokens = generateTokens(user.id, user.role);
  return tokens;
}

export async function getMe(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
      studentProfile: {
        select: {
          studentId: true,
          fullName: true,
          completionPercent: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          casteCategory: true,
        },
      },
    },
  });

  if (!user) throw new AppError(404, 'User not found');
  return user;
}
