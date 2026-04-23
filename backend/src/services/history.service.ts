import prisma from '../config/database';

type TrackChangesInput = {
	ticketId: string;
	changedById: string;
	before: Record<string, unknown>;
	after: Record<string, unknown>;
	trackedFields: string[];
};

export const historyService = {
	async trackChanges(input: TrackChangesInput) {
		const historyRecords = input.trackedFields
			.filter((field) => input.before[field] !== input.after[field])
			.map((field) => ({
				ticketId: input.ticketId,
				changedById: input.changedById,
				field,
				oldValue:
					input.before[field] === null || input.before[field] === undefined
						? null
						: String(input.before[field]),
				newValue:
					input.after[field] === null || input.after[field] === undefined
						? null
						: String(input.after[field]),
			}));

		if (historyRecords.length > 0) {
			await prisma.ticketHistory.createMany({ data: historyRecords });
		}
	},

	async getByTicketId(ticketId: string) {
		return prisma.ticketHistory.findMany({
			where: { ticketId },
			orderBy: { createdAt: 'desc' },
			include: {
				changedBy: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
					},
				},
			},
		});
	},
};
