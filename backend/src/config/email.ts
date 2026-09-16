/**
 * Email service with graceful no-op fallback.
 * If SMTP is not configured, emails are logged to console (development).
 * In production, configure SMTP_* env vars.
 */

import * as nodemailer from 'nodemailer';
import { env } from './env';
import logger from '../utils/logger';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private configured: boolean;

  constructor() {
    this.configured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);

    if (this.configured) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
      logger.info('[Email] SMTP configured and ready');
    } else {
      logger.warn('[Email] SMTP not configured — emails will be logged to console only');
    }
  }

  async send(payload: EmailPayload): Promise<void> {
    if (!this.configured || !this.transporter) {
      // Graceful fallback — log email instead of failing
      logger.info('[Email] [MOCK] Would have sent email:', {
        to: payload.to,
        subject: payload.subject,
        preview: payload.text?.substring(0, 100) ?? '(html only)',
      });
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `MargSarthi <${env.SMTP_FROM}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });
      logger.info(`[Email] Sent to ${payload.to}: ${payload.subject}`);
    } catch (error) {
      // Email failure should not break the main flow
      logger.error('[Email] Failed to send email:', error);
    }
  }

  // ---- Pre-built email templates ----

  async sendWelcome(to: string, name: string, studentId: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to MargSarthi — Your Student ID is Ready!',
      text: `Welcome ${name}! Your Student ID is ${studentId}. Login at margsarthi.co.in`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to MargSarthi! 🎓</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been created successfully.</p>
          <p>Your unique <strong>Student ID</strong> is:</p>
          <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; color: #4F46E5;">
            ${studentId}
          </div>
          <p>Please complete your profile to get started.</p>
          <a href="${env.FRONTEND_URL}/student/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            Go to Dashboard
          </a>
        </div>
      `,
    });
  }

  async sendTicketCreated(to: string, name: string, ticketNumber: string, category: string): Promise<void> {
    await this.send({
      to,
      subject: `Ticket ${ticketNumber} received — MargSarthi`,
      text: `Hi ${name}, your ticket ${ticketNumber} for ${category} has been received.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Ticket Received ✅</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your request has been received and will be attended to shortly.</p>
          <p><strong>Ticket ID:</strong> ${ticketNumber}</p>
          <p><strong>Category:</strong> ${category}</p>
          <a href="${env.FRONTEND_URL}/student/tickets" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            View Request
          </a>
        </div>
      `,
    });
  }

  async sendTicketClosed(to: string, name: string, ticketNumber: string, note: string): Promise<void> {
    await this.send({
      to,
      subject: `Ticket ${ticketNumber} resolved — MargSarthi`,
      text: `Hi ${name}, your ticket ${ticketNumber} has been resolved. Note: ${note}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Request Resolved 🎉</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your ticket <strong>${ticketNumber}</strong> has been resolved.</p>
          ${note ? `<p><strong>Note from counselor:</strong> ${note}</p>` : ''}
          <a href="${env.FRONTEND_URL}/student/closed-requests" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            View Details
          </a>
        </div>
      `,
    });
  }

  async sendAppointmentConfirmed(
    to: string,
    name: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<void> {
    await this.send({
      to,
      subject: 'Quick Call Confirmed — MargSarthi',
      text: `Hi ${name}, your call on ${date} at ${startTime}–${endTime} is confirmed.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Call Confirmed 📞</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your Quick Call appointment is confirmed.</p>
          <div style="background: #F3F4F6; padding: 16px; border-radius: 8px;">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${startTime} – ${endTime}</p>
          </div>
          <a href="${env.FRONTEND_URL}/student/appointments" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            View Appointment
          </a>
        </div>
      `,
    });
  }

  async sendPasswordReset(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.send({
      to,
      subject: 'Reset Your MargSarthi Password',
      text: `Hi ${name}, reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
          <p style="color:#6B7280;font-size:12px;margin-top:16px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
