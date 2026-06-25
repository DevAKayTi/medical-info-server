import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createCategorySchema, updateCategorySchema } from '../../validators/product.validator';

const router = Router();

// Public
router.get('/public', categoryController.getPublicCategories);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.CATEGORIES_READ), categoryController.getAllCategories);
router.get('/:id', authorize(PERMISSIONS.CATEGORIES_READ), categoryController.getCategoryById);
router.post('/', authorize(PERMISSIONS.CATEGORIES_WRITE), validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authorize(PERMISSIONS.CATEGORIES_WRITE), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authorize(PERMISSIONS.CATEGORIES_DELETE), categoryController.deleteCategory);
router.post('/:id/image', authorize(PERMISSIONS.CATEGORIES_WRITE), uploadImage.single('image'), categoryController.uploadImage);

export default router;
