import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import {
  createProductSchema,
  updateProductSchema,
  bulkStatusSchema,
} from '../../validators/product.validator';

const router = Router();

// ── Public routes ─────────────────────────────────────────────
router.get('/public', productController.getPublicProducts);
router.get('/public/:slug', productController.getPublicProductBySlug);

// ── Admin routes (all require auth) ───────────────────────────
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.PRODUCTS_READ), productController.getAllProducts);
router.get('/:id', authorize(PERMISSIONS.PRODUCTS_READ), productController.getProductById);

router.post(
  '/',
  authorize(PERMISSIONS.PRODUCTS_WRITE),
  validate(createProductSchema),
  productController.createProduct,
);

router.put(
  '/:id',
  authorize(PERMISSIONS.PRODUCTS_WRITE),
  validate(updateProductSchema),
  productController.updateProduct,
);

router.delete('/:id', authorize(PERMISSIONS.PRODUCTS_DELETE), productController.deleteProduct);

router.post(
  '/:id/images',
  authorize(PERMISSIONS.PRODUCTS_WRITE),
  uploadImage.single('image'),
  productController.uploadProductImage,
);

router.delete(
  '/:id/images/:publicId',
  authorize(PERMISSIONS.PRODUCTS_WRITE),
  productController.deleteProductImage,
);

router.put(
  '/bulk/status',
  authorize(PERMISSIONS.PRODUCTS_WRITE),
  validate(bulkStatusSchema),
  productController.bulkUpdateStatus,
);

export default router;
