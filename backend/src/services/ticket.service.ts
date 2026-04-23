import { Priority, Role, TicketStatus } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import {
	AssignTicketInput,
	CreateTicketInput,
	UpdateTicketInput,
	UpdateTicketStatusInput,
} from '../schemas/ticket.schema';
import { buildPaginationMeta, getPaginationSkip } from '../utils/pagination';
import { historyService } from './history.service';

type ListTicketParams = {
	userId: string;
	role: Role;
	page: number;
	limit: number;
	status?: TicketStatus;
	priority?: Priority;
	assignedToId?: string;
	search?: string;
	startDate?: Date;
	endDate?: Date;
};

const ticketInclude = {
	createdBy: { select: { id: true, name: true, email: true, role: true } },
	assignedTo: { select: { id: true, name: true, email: true, role: true } },
	_count: { select: { comments: true } },
};

export const ticketService = {
	async list(params: ListTicketParams) {
		const where: Record<string, unknown> = {};

		if (params.role === Role.CLIENT) {
			where.createdById = params.userId;
		}

		if (params.role === Role.AGENT) {
			where.OR = [{ assignedToId: params.userId }, { createdById: params.userId }];
		}

		if (params.status) {
			where.status = params.status;
		}

		if (params.priority) {
			where.priority = params.priority;
		}

		if (params.assignedToId) {
			where.assignedToId = params.assignedToId;
		}

		if (params.search) {
			where.OR = [
				...(Array.isArray(where.OR) ? (where.OR as unknown[]) : []),
				{ title: { contains: params.search, mode: 'insensitive' } },
				{ description: { contains: params.search, mode: 'insensitive' } },
			];
		}

		if (params.startDate || params.endDate) {
			where.createdAt = {
				...(params.startDate ? { gte: params.startDate } : {}),
				...(params.endDate ? { lte: params.endDate } : {}),
			};
		}

		const [tickets, total] = await Promise.all([
			prisma.ticket.findMany({
				where,
				include: ticketInclude,
				orderBy: { createdAt: 'desc' },
				skip: getPaginationSkip({ page: params.page, limit: params.limit }),
				take: params.limit,
			}),
			prisma.ticket.count({ where }),
		]);

		return {
			data: tickets,
			pagination: buildPaginationMeta(total, { page: params.page, limit: params.limit }),
		};
	},

	async getById(id: string, userId: string, role: Role) {
		const ticket = await prisma.ticket.findUnique({
			where: { id },
			include: {
				...ticketInclude,
				comments: {
					include: {
						author: { select: { id: true, name: true, email: true, role: true } },
					},
					orderBy: { createdAt: 'asc' },
				},
				history: {
					include: {
						changedBy: { select: { id: true, name: true, email: true, role: true } },
					},
					orderBy: { createdAt: 'desc' },
				},
			},
		});

		if (!ticket) {
			throw new AppError('Ticket not found', 404);
		}

		if (role === Role.CLIENT && ticket.createdById !== userId) {
			throw new AppError('Forbidden', 403);
		}

		if (
			role === Role.AGENT &&
			ticket.assignedToId !== userId &&
			ticket.createdById !== userId
		) {
			throw new AppError('Forbidden', 403);
		}

		return ticket;
	},

	async create(input: CreateTicketInput, createdById: string, role: Role) {
		if (input.assignedToId) {
			const assignedUser = await prisma.user.findUnique({ where: { id: input.assignedToId } });
			if (!assignedUser) {
				throw new AppError('Assigned user not found', 404);
			}
			if (assignedUser.role !== Role.AGENT && assignedUser.role !== Role.ADMIN) {
				throw new AppError('Ticket can only be assigned to an agent/admin', 400);
			}

			if (role === Role.CLIENT) {
				throw new AppError('Clients cannot assign tickets at creation', 403);
			}
		}

		return prisma.ticket.create({
			data: {
				title: input.title,
				description: input.description,
				priority: input.priority,
				assignedToId: input.assignedToId,
				createdById,
			},
			include: ticketInclude,
		});
	},

	async update(id: string, input: UpdateTicketInput, userId: string, role: Role) {
		const existing = await prisma.ticket.findUnique({ where: { id } });
		if (!existing) {
			throw new AppError('Ticket not found', 404);
		}

		const isOwner = existing.createdById === userId;
		const isAssignedAgent = existing.assignedToId === userId;

		if (role === Role.CLIENT && !isOwner) {
			throw new AppError('Forbidden', 403);
		}

		if (role === Role.AGENT && !isAssignedAgent && !isOwner) {
			throw new AppError('Forbidden', 403);
		}

		if (role === Role.CLIENT) {
			const allowedClientFields = ['title', 'description'] as const;
			const hasForbiddenField = Object.keys(input).some(
				(key) => !allowedClientFields.includes(key as (typeof allowedClientFields)[number])
			);
			if (hasForbiddenField) {
				throw new AppError('Clients can only update title and description', 403);
			}
		}

		if (input.assignedToId !== undefined && input.assignedToId !== null) {
			const assignedUser = await prisma.user.findUnique({ where: { id: input.assignedToId } });
			if (!assignedUser) {
				throw new AppError('Assigned user not found', 404);
			}
			if (assignedUser.role !== Role.AGENT && assignedUser.role !== Role.ADMIN) {
				throw new AppError('Ticket can only be assigned to an agent/admin', 400);
			}
		}

		const updated = await prisma.ticket.update({
			where: { id },
			data: input,
			include: ticketInclude,
		});

		await historyService.trackChanges({
			ticketId: id,
			changedById: userId,
			before: existing,
			after: updated,
			trackedFields: ['title', 'description', 'priority', 'status', 'assignedToId'],
		});

		return updated;
	},

	async updateStatus(id: string, input: UpdateTicketStatusInput, userId: string, role: Role) {
		const existing = await prisma.ticket.findUnique({ where: { id } });
		if (!existing) {
			throw new AppError('Ticket not found', 404);
		}

		const isOwner = existing.createdById === userId;
		const isAssignedAgent = existing.assignedToId === userId;

		if (role === Role.CLIENT && !isOwner) {
			throw new AppError('Forbidden', 403);
		}

		if (role === Role.AGENT && !isAssignedAgent && !isOwner) {
			throw new AppError('Forbidden', 403);
		}

		const updated = await prisma.ticket.update({
			where: { id },
			data: { status: input.status },
			include: ticketInclude,
		});

		await historyService.trackChanges({
			ticketId: id,
			changedById: userId,
			before: existing,
			after: updated,
			trackedFields: ['status'],
		});

		return updated;
	},

	async assign(id: string, input: AssignTicketInput, changedById: string) {
		const existing = await prisma.ticket.findUnique({ where: { id } });
		if (!existing) {
			throw new AppError('Ticket not found', 404);
		}

		if (input.assignedToId) {
			const assignedUser = await prisma.user.findUnique({ where: { id: input.assignedToId } });
			if (!assignedUser) {
				throw new AppError('Assigned user not found', 404);
			}
			if (assignedUser.role !== Role.AGENT && assignedUser.role !== Role.ADMIN) {
				throw new AppError('Ticket can only be assigned to an agent/admin', 400);
			}
		}

		const updated = await prisma.ticket.update({
			where: { id },
			data: { assignedToId: input.assignedToId ?? null },
			include: ticketInclude,
		});

		await historyService.trackChanges({
			ticketId: id,
			changedById,
			before: existing,
			after: updated,
			trackedFields: ['assignedToId'],
		});

		return updated;
	},

	async remove(id: string) {
		const existing = await prisma.ticket.findUnique({ where: { id } });
		if (!existing) {
			throw new AppError('Ticket not found', 404);
		}

		await prisma.ticket.delete({ where: { id } });
	},
};
