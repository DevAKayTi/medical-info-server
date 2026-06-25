import { Router } from 'express';
import { roleController } from './role.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.use(authenticate, authorize(PERMISSIONS.ROLES_MANAGE));

router.get('/', roleController.getAllRoles);
router.get('/permissions', roleController.getAvailablePermissions);
router.get('/:id', roleController.getRoleById);
router.put('/:id/permissions', roleController.updateRolePermissions);

export default router;
