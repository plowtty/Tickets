import { Request, Response, NextFunction } from 'express';
import { Priority, TicketStatus } from '@prisma/client';
import { ApiResponse } from '../utils/apiResponse';
import { getPaginationParams } from '../utils/pagination';
import { ticketService } from '../services/ticket.service';

export const ticketController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const { page, limit } = getPaginationParams(req.query.page as string, req.query.limit as string);

			const data = await ticketService.list({
				userId: req.user!.id,
				role: req.user!.role,
				page,
				limit,
				status: req.query.status as TicketStatus | undefined,
				priority: req.query.priority as Priority | undefined,
				assignedToId: req.query.assignedToId as string | undefined,
				search: req.query.search as string | undefined,
				startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
				endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
			});

			ApiResponse.paginated(res, data.data, data.pagination);
		} catch (error) {
			next(error);
		}
	},

	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const ticket = await ticketService.getById(req.params.id, req.user!.id, req.user!.role);
			ApiResponse.success(res, ticket);
		} catch (error) {
			next(error);
		}
	},

	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const ticket = await ticketService.create(req.body, req.user!.id, req.user!.role);
			ApiResponse.created(res, ticket, 'Ticket created successfully');
		} catch (error) {
			next(error);
		}
	},

	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const ticket = await ticketService.update(req.params.id, req.body, req.user!.id, req.user!.role);
			ApiResponse.success(res, ticket, 200, 'Ticket updated successfully');
		} catch (error) {
			next(error);
		}
	},

	async updateStatus(req: Request, res: Response, next: NextFunction) {
		try {
			const ticket = await ticketService.updateStatus(
				req.params.id,
				req.body,
				req.user!.id,
				req.user!.role
			);
			ApiResponse.success(res, ticket, 200, 'Ticket status updated successfully');
		} catch (error) {
			next(error);
		}
	},

	async assign(req: Request, res: Response, next: NextFunction) {
		try {
			const ticket = await ticketService.assign(req.params.id, req.body, req.user!.id);
			ApiResponse.success(res, ticket, 200, 'Ticket assignment updated successfully');
		} catch (error) {
			next(error);
		}
	},

	async remove(req: Request, res: Response, next: NextFunction) {
		try {
			await ticketService.remove(req.params.id);
			ApiResponse.noContent(res);
		} catch (error) {
			next(error);
		}
	},
};
