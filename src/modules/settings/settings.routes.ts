import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { uploadImage } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.SETTINGS_READ), settingsController.getSettings);
router.put('/', authorize(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateSettings);
router.put('/logo', authorize(PERMISSIONS.SETTINGS_MANAGE), uploadImage.single('logo'), settingsController.uploadLogo);
router.put('/favicon', authorize(PERMISSIONS.SETTINGS_MANAGE), uploadImage.single('favicon'), settingsController.uploadFavicon);

export default router;
