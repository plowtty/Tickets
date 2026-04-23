import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { UpdateUserInput } from '../schemas/user.schema';

const userSelect = {
	id: true,
	name: true,
	email: true,
	role: true,
	avatar: true,
	active: true,
	createdAt: true,
	updatedAt: true,
};

export const userService = {
	async list() {
		return prisma.user.findMany({
			select: userSelect,
			orderBy: { createdAt: 'desc' },
		});
	},

	async update(id: string, input: UpdateUserInput) {
		const existing = await prisma.user.findUnique({ where: { id } });
		if (!existing) {
			throw new AppError('User not found', 404);
		}

		return prisma.user.update({
			where: { id },
			data: input,
			select: userSelect,
		});
	},

	async remove(id: string) {
		const existing = await prisma.user.findUnique({ where: { id } });
		if (!existing) {
			throw new AppError('User not found', 404);
		}

		await prisma.user.delete({ where: { id } });
	},
};
