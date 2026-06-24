import nodemailer from 'nodemailer';
import { env } from './env';

export const emailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
});

export const verifyEmailConnection = async (): Promise<void> => {
  if (!env.SMTP_USER) {
    console.warn('⚠️  Email not configured — SMTP_USER not set');
    return;
  }
  try {
    await emailTransporter.verify();
    console.log('✅ Email transporter ready');
  } catch (err) {
    console.warn('⚠️  Email transporter verification failed:', (err as Error).message);
  }
};
