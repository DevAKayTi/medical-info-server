import { Router } from 'express';
import { partnerController } from './partner.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createPartnerSchema, updatePartnerSchema } from '../../validators/partner.validator';

const router = Router();

// Public
router.get('/public', partnerController.getPublicPartners);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.BRANDS_READ), partnerController.getAllPartners);
router.get('/:id', authorize(PERMISSIONS.BRANDS_READ), partnerController.getPartnerById);
router.post('/', authorize(PERMISSIONS.BRANDS_WRITE), validate(createPartnerSchema), partnerController.createPartner);
router.put('/:id', authorize(PERMISSIONS.BRANDS_WRITE), validate(updatePartnerSchema), partnerController.updatePartner);
router.delete('/:id', authorize(PERMISSIONS.BRANDS_DELETE), partnerController.deletePartner);
router.post('/:id/logo', authorize(PERMISSIONS.BRANDS_WRITE), uploadImage.single('logo'), partnerController.uploadLogo);

export default router;
