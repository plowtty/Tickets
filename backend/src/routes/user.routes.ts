import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { userController } from '../controllers/user.controller';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.use(authenticate, requireAdmin);

router.post('/', validate(createUserSchema), userController.create);
router.get('/', userController.list);
router.patch('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.remove);

export default router;
