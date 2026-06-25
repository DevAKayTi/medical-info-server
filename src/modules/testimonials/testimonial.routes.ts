import { Router } from 'express';
import { testimonialController } from './testimonial.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createTestimonialSchema, updateTestimonialSchema } from '../../validators/testimonial.validator';

const router = Router();

// Public
router.get('/public', testimonialController.getPublicTestimonials);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.TESTIMONIALS_READ), testimonialController.getAllTestimonials);
router.get('/:id', authorize(PERMISSIONS.TESTIMONIALS_READ), testimonialController.getTestimonialById);
router.post('/', authorize(PERMISSIONS.TESTIMONIALS_WRITE), validate(createTestimonialSchema), testimonialController.createTestimonial);
router.put('/:id', authorize(PERMISSIONS.TESTIMONIALS_WRITE), validate(updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete('/:id', authorize(PERMISSIONS.TESTIMONIALS_DELETE), testimonialController.deleteTestimonial);
router.post('/:id/avatar', authorize(PERMISSIONS.TESTIMONIALS_WRITE), uploadImage.single('avatar'), testimonialController.uploadAvatar);

export default router;
