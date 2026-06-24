import { inquiryRepository } from './inquiry.repository';
import { emailService } from '../../services/email.service';
import { AppError } from '../../shared/AppError';
import { parseQueryOptions } from '../../utils/filterBuilder';
import type { CreateInquiryInput } from '../../validators/inquiry.validator';

export const inquiryService = {
  async submitInquiry(data: CreateInquiryInput, ip?: string) {
    const inquiry = await inquiryRepository.create({ ...data, ipAddress: ip } as Record<string, unknown>);
    // Fire and forget email notification
    emailService.sendInquiryNotification({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      subject: data.subject,
      message: data.message,
    }).catch(console.error);
    return inquiry;
  },

  async getInquiries(query: Record<string, unknown>) {
    const { page, limit, sort } = parseQueryOptions(query);
    return inquiryRepository.findWithFilters({
      search: query.search as string,
      status: query.status as string,
      page,
      limit,
      sort,
    });
  },

  async getInquiryById(id: string) {
    const inquiry = await inquiryRepository.findById(id, 'assignedTo');
    if (!inquiry) throw AppError.notFound('Inquiry');
    return inquiry;
  },

  async updateStatus(id: string, status: string, assignedTo?: string) {
    const inquiry = await inquiryRepository.update(id, {
      status,
      ...(assignedTo && { assignedTo }),
    });
    if (!inquiry) throw AppError.notFound('Inquiry');
    return inquiry;
  },

  async respond(id: string, response: string, respondedBy: string) {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) throw AppError.notFound('Inquiry');

    const updated = await inquiryRepository.update(id, {
      response,
      respondedAt: new Date(),
      status: 'resolved',
    });

    // Send response email
    const inquiryObj = inquiry as unknown as {
      firstName: string; lastName: string; email: string; subject: string;
    };
    emailService.send({
      to: inquiryObj.email,
      subject: `Re: ${inquiryObj.subject} — MediSource Global`,
      html: `<p>Dear ${inquiryObj.firstName} ${inquiryObj.lastName},</p><p>${response}</p><p>Best regards,<br/>MediSource Global Team</p>`,
    }).catch(console.error);

    return updated;
  },

  async archiveInquiry(id: string) {
    const inquiry = await inquiryRepository.update(id, { status: 'archived' });
    if (!inquiry) throw AppError.notFound('Inquiry');
    return inquiry;
  },
};
