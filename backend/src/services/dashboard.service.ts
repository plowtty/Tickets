import { TicketStatus } from '@prisma/client';
import prisma from '../config/database';

export const dashboardService = {
	async stats() {
		const [totalTickets, byStatus, byPriority, openTickets, inProgressTickets, recentTickets] =
			await Promise.all([
				prisma.ticket.count(),
				prisma.ticket.groupBy({ by: ['status'], _count: { _all: true } }),
				prisma.ticket.groupBy({ by: ['priority'], _count: { _all: true } }),
				prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
				prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
				prisma.ticket.findMany({
					take: 5,
					orderBy: { createdAt: 'desc' },
					include: {
						createdBy: { select: { id: true, name: true } },
						assignedTo: { select: { id: true, name: true } },
					},
				}),
			]);

		return {
			totalTickets,
			openTickets,
			inProgressTickets,
			byStatus: byStatus.map((item) => ({ status: item.status, count: item._count._all })),
			byPriority: byPriority.map((item) => ({ priority: item.priority, count: item._count._all })),
			recentTickets,
		};
	},

	async agentStats() {
		const agents = await prisma.user.findMany({
			where: { role: 'AGENT', active: true },
			select: {
				id: true,
				name: true,
				email: true,
				assignedTickets: {
					select: { id: true, status: true, priority: true },
				},
			},
		});

		return agents.map((agent) => {
			const totalAssigned = agent.assignedTickets.length;
			const open = agent.assignedTickets.filter((t) => t.status === 'OPEN').length;
			const inProgress = agent.assignedTickets.filter((t) => t.status === 'IN_PROGRESS').length;
			const resolved = agent.assignedTickets.filter((t) => t.status === 'RESOLVED').length;
			const closed = agent.assignedTickets.filter((t) => t.status === 'CLOSED').length;
			const critical = agent.assignedTickets.filter((t) => t.priority === 'CRITICAL').length;

			return {
				id: agent.id,
				name: agent.name,
				email: agent.email,
				totalAssigned,
				open,
				inProgress,
				resolved,
				closed,
				critical,
			};
		});
	},
};
