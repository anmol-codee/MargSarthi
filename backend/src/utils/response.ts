/**
 * Standard API response helpers.
 * Ensures consistent response format across all routes.
 */

import { Response } from 'express';

export function success<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function created<T>(res: Response, data: T, message = 'Created') {
  return res.status(201).json({ success: true, message, data });
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function badRequest(res: Response, message = 'Bad request', errors?: unknown) {
  return res.status(400).json({ success: false, message, errors });
}

export function unauthorized(res: Response, message = 'Unauthorized') {
  return res.status(401).json({ success: false, message });
}

export function forbidden(res: Response, message = 'Forbidden') {
  return res.status(403).json({ success: false, message });
}

export function notFound(res: Response, message = 'Not found') {
  return res.status(404).json({ success: false, message });
}

export function conflict(res: Response, message = 'Conflict') {
  return res.status(409).json({ success: false, message });
}

export function unprocessable(res: Response, message = 'Unprocessable entity', errors?: unknown) {
  return res.status(422).json({ success: false, message, errors });
}

export function tooManyRequests(res: Response, message = 'Too many requests') {
  return res.status(429).json({ success: false, message });
}

export function serverError(res: Response, message = 'Internal server error') {
  return res.status(500).json({ success: false, message });
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginated<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}
