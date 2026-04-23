import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { commentController } from '../controllers/comment.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', commentController.list);
router.post('/', validate(commentController.createSchema), commentController.create);
router.delete('/:commentId', commentController.remove);

export default router;
