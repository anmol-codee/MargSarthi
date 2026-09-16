/**
 * Authentication & Authorization Middleware
 * - requireAuth: validates JWT, attaches user to req
 * - requireStudent: requireAuth + must be STUDENT role
 * - requireAdmin: requireAuth + must be ADMIN role
 *
 * Identity is ALWAYS derived from the verified JWT — never from frontend payload.
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { unauthorized, forbidden } from '../utils/response';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function extractToken(req: Request): string | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Fallback: check cookie
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    unauthorized(res, 'Authentication required');
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    // Fetch user from DB to ensure account is still active
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      unauthorized(res, 'Account not found or deactivated');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      unauthorized(res, 'Session expired. Please login again.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      unauthorized(res, 'Invalid authentication token');
    } else {
      unauthorized(res, 'Authentication failed');
    }
  }
}

export async function requireStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== Role.STUDENT) {
      forbidden(res, 'Student access required');
      return;
    }
    next();
  });
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== Role.ADMIN) {
      forbidden(res, 'Admin access required');
      return;
    }
    next();
  });
}
