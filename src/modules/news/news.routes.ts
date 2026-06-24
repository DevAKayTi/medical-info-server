import { Router } from 'express';
import { newsController } from './news.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createNewsSchema, updateNewsSchema } from '../../validators/news.validator';

const router = Router();

// Public
router.get('/public', newsController.getPublicNews);
router.get('/public/:slug', newsController.getPublicNewsBySlug);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.NEWS_READ), newsController.getAllNews);
router.get('/:id', authorize(PERMISSIONS.NEWS_READ), newsController.getNewsById);
router.post('/', authorize(PERMISSIONS.NEWS_WRITE), validate(createNewsSchema), newsController.createNews);
router.put('/:id', authorize(PERMISSIONS.NEWS_WRITE), validate(updateNewsSchema), newsController.updateNews);
router.put('/:id/publish', authorize(PERMISSIONS.NEWS_PUBLISH), newsController.publishNews);
router.put('/:id/unpublish', authorize(PERMISSIONS.NEWS_PUBLISH), newsController.unpublishNews);
router.delete('/:id', authorize(PERMISSIONS.NEWS_DELETE), newsController.deleteNews);
router.post('/:id/cover', authorize(PERMISSIONS.NEWS_WRITE), uploadImage.single('image'), newsController.uploadCoverImage);

export default router;
