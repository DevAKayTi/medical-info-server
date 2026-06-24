import { Router } from 'express';
import { inquiryController } from './inquiry.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { PERMISSIONS } from '../../constants/permissions';
import {
  createInquirySchema,
  updateInquiryStatusSchema,
  respondInquirySchema,
} from '../../validators/inquiry.validator';

const router = Router();

// Public: submit inquiry
router.post('/submit', validate(createInquirySchema), inquiryController.submitInquiry);

// Admin routes
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.INQUIRIES_READ), inquiryController.getInquiries);
router.get('/:id', authorize(PERMISSIONS.INQUIRIES_READ), inquiryController.getInquiryById);
router.put('/:id/status', authorize(PERMISSIONS.INQUIRIES_RESPOND), validate(updateInquiryStatusSchema), inquiryController.updateStatus);
router.post('/:id/respond', authorize(PERMISSIONS.INQUIRIES_RESPOND), validate(respondInquirySchema), inquiryController.respond);
router.put('/:id/archive', authorize(PERMISSIONS.INQUIRIES_DELETE), inquiryController.archiveInquiry);

export default router;
