import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrAgent } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { ticketController } from '../controllers/ticket.controller';
import {
	assignTicketSchema,
	createTicketSchema,
	updateTicketSchema,
	updateTicketStatusSchema,
} from '../schemas/ticket.schema';

const router = Router();

router.use(authenticate);

router.get('/', ticketController.list);
router.get('/:id', ticketController.getById);
router.post('/', validate(createTicketSchema), ticketController.create);
router.patch('/:id', validate(updateTicketSchema), ticketController.update);
router.patch('/:id/status', validate(updateTicketStatusSchema), ticketController.updateStatus);
router.patch('/:id/assign', requireAdminOrAgent, validate(assignTicketSchema), ticketController.assign);
router.delete('/:id', requireAdmin, ticketController.remove);

export default router;
