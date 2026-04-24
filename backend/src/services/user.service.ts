import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { hashPassword } from '../utils/password';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

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
	async create(input: CreateUserInput) {
		const existing = await prisma.user.findUnique({ where: { email: input.email } });
		if (existing) {
			throw new AppError('Email already in use', 409);
		}

		const hashedPassword = await hashPassword(input.password);

		return prisma.user.create({
			data: {
				name: input.name,
				email: input.email,
				password: hashedPassword,
				role: input.role,
				active: input.active,
				avatar: input.avatar,
			},
			select: userSelect,
		});
	},

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
