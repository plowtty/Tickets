import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrAgent } from '../middleware/role.middleware';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);
router.get('/stats', requireAdminOrAgent, dashboardController.stats);
router.get('/agent-stats', requireAdmin, dashboardController.agentStats);

export default router;
