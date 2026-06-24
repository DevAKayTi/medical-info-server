import { Router } from 'express';
import { galleryController } from './gallery.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

// Public
router.get('/public', galleryController.getGallery);
router.get('/public/categories', galleryController.getCategories);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.GALLERY_READ), galleryController.getGallery);
router.get('/categories', authorize(PERMISSIONS.GALLERY_READ), galleryController.getCategories);
router.post('/', authorize(PERMISSIONS.GALLERY_WRITE), uploadImage.single('image'), galleryController.uploadImage);
router.put('/:id', authorize(PERMISSIONS.GALLERY_WRITE), galleryController.updateImage);
router.delete('/bulk', authorize(PERMISSIONS.GALLERY_DELETE), galleryController.bulkDelete);
router.delete('/:id', authorize(PERMISSIONS.GALLERY_DELETE), galleryController.deleteImage);

export default router;
