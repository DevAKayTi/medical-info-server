import { Router } from 'express';
import { downloadController } from './download.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadDocument } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createDownloadSchema, updateDownloadSchema } from '../../validators/download.validator';

const router = Router();

// Public
router.get('/public', downloadController.getPublicDownloads);
router.get('/public/:id/download', downloadController.downloadFile);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.DOWNLOADS_READ), downloadController.getAllDownloads);
router.get('/:id', authorize(PERMISSIONS.DOWNLOADS_READ), downloadController.getDownloadById);
router.post('/', authorize(PERMISSIONS.DOWNLOADS_WRITE), uploadDocument.single('file'), validate(createDownloadSchema), downloadController.createDownload);
router.put('/:id', authorize(PERMISSIONS.DOWNLOADS_WRITE), validate(updateDownloadSchema), downloadController.updateDownload);
router.delete('/:id', authorize(PERMISSIONS.DOWNLOADS_DELETE), downloadController.deleteDownload);

export default router;
