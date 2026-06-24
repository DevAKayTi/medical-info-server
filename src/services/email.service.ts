import { emailTransporter } from '../config/email';
import { env } from '../config/env';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  async send(options: SendEmailOptions): Promise<void> {
    if (!env.SMTP_USER) {
      console.warn('⚠️  Email not sent — SMTP not configured');
      return;
    }
    await emailTransporter.sendMail({
      from: env.EMAIL_FROM,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  },

  async sendInquiryNotification(inquiry: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await this.send({
      to: env.DEFAULT_SUPER_ADMIN_EMAIL,
      subject: `New Inquiry: ${inquiry.subject}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>From:</strong> ${inquiry.firstName} ${inquiry.lastName} (${inquiry.email})</p>
        <p><strong>Subject:</strong> ${inquiry.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${inquiry.message}</p>
        <hr/>
        <p><a href="${env.ADMIN_URL}/inquiries">View in Admin Panel</a></p>
      `,
    });
  },

  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    await this.send({
      to,
      subject: 'Password Reset Request — MediSource Global',
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <p>This link will expire in <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  },

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to MediSource Global Admin',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your admin account for MediSource Global has been created.</p>
        <p><a href="${env.ADMIN_URL}">Access the Admin Panel</a></p>
      `,
    });
  },

  async sendApplicantNotification(applicant: {
    name: string;
    email: string;
    jobTitle: string;
  }): Promise<void> {
    await this.send({
      to: env.DEFAULT_SUPER_ADMIN_EMAIL,
      subject: `New Job Application: ${applicant.jobTitle}`,
      html: `
        <h2>New Job Application</h2>
        <p><strong>Position:</strong> ${applicant.jobTitle}</p>
        <p><strong>Applicant:</strong> ${applicant.name} (${applicant.email})</p>
        <a href="${env.ADMIN_URL}/careers">View in Admin Panel</a>
      `,
    });
  },
};
