import { Role } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

const commentInclude = {
	author: { select: { id: true, name: true, email: true, role: true } },
};

const assertTicketAccess = async (ticketId: string, userId: string, role: Role) => {
	const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

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
};

export const commentService = {
	async list(ticketId: string, userId: string, role: Role) {
		await assertTicketAccess(ticketId, userId, role);

		return prisma.comment.findMany({
			where: { ticketId },
			include: commentInclude,
			orderBy: { createdAt: 'asc' },
		});
	},

	async create(ticketId: string, body: string, userId: string, role: Role) {
		await assertTicketAccess(ticketId, userId, role);

		return prisma.comment.create({
			data: {
				ticketId,
				body,
				authorId: userId,
			},
			include: commentInclude,
		});
	},

	async remove(ticketId: string, commentId: string, userId: string, role: Role) {
		await assertTicketAccess(ticketId, userId, role);

		const comment = await prisma.comment.findUnique({ where: { id: commentId } });
		if (!comment || comment.ticketId !== ticketId) {
			throw new AppError('Comment not found', 404);
		}

		if (role !== Role.ADMIN && comment.authorId !== userId) {
			throw new AppError('Forbidden', 403);
		}

		await prisma.comment.delete({ where: { id: commentId } });
	},
};
