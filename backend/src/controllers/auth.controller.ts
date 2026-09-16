import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { success, created } from '../utils/response';

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/\d/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.registerStudent(body);
    created(res, result, 'Account created successfully');
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.loginUser(body);

    // Return refresh token in the response body (not cookie) for cross-domain compatibility.
    // Mobile browsers (Safari ITP, Chrome cookie restrictions) block cross-site cookies,
    // so storing in localStorage is the reliable approach for Vercel <-> Railway deploys.
    success(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    // Accept refresh token from body (primary) or cookie (legacy fallback)
    const token = req.body?.refreshToken || req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }
    const tokens = await authService.refreshAccessToken(token);
    success(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken');
  success(res, null, 'Logged out successfully');
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.id);
    success(res, user);
  } catch (err) {
    next(err);
  }
}
