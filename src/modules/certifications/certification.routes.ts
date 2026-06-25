import { Router } from 'express';
import { certificationController } from './certification.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createCertificationSchema, updateCertificationSchema } from '../../validators/certification.validator';

const router = Router();

// Public
router.get('/public', certificationController.getPublicCertifications);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.CERTIFICATIONS_READ), certificationController.getAllCertifications);
router.get('/:id', authorize(PERMISSIONS.CERTIFICATIONS_READ), certificationController.getCertificationById);
router.post('/', authorize(PERMISSIONS.CERTIFICATIONS_WRITE), validate(createCertificationSchema), certificationController.createCertification);
router.put('/:id', authorize(PERMISSIONS.CERTIFICATIONS_WRITE), validate(updateCertificationSchema), certificationController.updateCertification);
router.delete('/:id', authorize(PERMISSIONS.CERTIFICATIONS_DELETE), certificationController.deleteCertification);
router.post('/:id/image', authorize(PERMISSIONS.CERTIFICATIONS_WRITE), uploadImage.single('image'), certificationController.uploadImage);

export default router;
