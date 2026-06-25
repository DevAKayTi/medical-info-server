import { Router } from 'express';
import { serviceController } from './service.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createServiceSchema, updateServiceSchema } from '../../validators/service.validator';

const router = Router();

// Public
router.get('/public', serviceController.getPublicServices);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.SERVICES_READ), serviceController.getAllServices);
router.get('/:id', authorize(PERMISSIONS.SERVICES_READ), serviceController.getServiceById);
router.post('/', authorize(PERMISSIONS.SERVICES_WRITE), validate(createServiceSchema), serviceController.createService);
router.put('/:id', authorize(PERMISSIONS.SERVICES_WRITE), validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authorize(PERMISSIONS.SERVICES_DELETE), serviceController.deleteService);
router.post('/:id/image', authorize(PERMISSIONS.SERVICES_WRITE), uploadImage.single('image'), serviceController.uploadImage);

export default router;
