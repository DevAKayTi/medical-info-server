import { Router } from 'express';
import { brandController } from './brand.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createBrandSchema, updateBrandSchema } from '../../validators/brand.validator';

const router = Router();

// Public
router.get('/public', brandController.getPublicBrands);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.BRANDS_READ), brandController.getAllBrands);
router.get('/:id', authorize(PERMISSIONS.BRANDS_READ), brandController.getBrandById);
router.post('/', authorize(PERMISSIONS.BRANDS_WRITE), validate(createBrandSchema), brandController.createBrand);
router.put('/:id', authorize(PERMISSIONS.BRANDS_WRITE), validate(updateBrandSchema), brandController.updateBrand);
router.delete('/:id', authorize(PERMISSIONS.BRANDS_DELETE), brandController.deleteBrand);
router.post('/:id/logo', authorize(PERMISSIONS.BRANDS_WRITE), uploadImage.single('logo'), brandController.uploadLogo);

export default router;
