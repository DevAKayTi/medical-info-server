import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { PERMISSIONS } from '../../constants/permissions';
import { createUserSchema, updateUserSchema, updateStatusSchema } from '../../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.USERS_READ), userController.getUsers);
router.get('/:id', authorize(PERMISSIONS.USERS_READ), userController.getUserById);
router.post('/', authorize(PERMISSIONS.USERS_WRITE), validate(createUserSchema), userController.createUser);
router.put('/:id', authorize(PERMISSIONS.USERS_WRITE), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorize(PERMISSIONS.USERS_DELETE), userController.deleteUser);
router.put('/:id/status', authorize(PERMISSIONS.USERS_WRITE), validate(updateStatusSchema), userController.updateStatus);

export default router;
