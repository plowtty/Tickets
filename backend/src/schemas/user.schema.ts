import { Role } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.string().email(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number'),
	role: z.nativeEnum(Role).optional(),
	active: z.boolean().optional(),
	avatar: z.string().url().nullable().optional(),
});

export const updateUserSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	role: z.nativeEnum(Role).optional(),
	active: z.boolean().optional(),
	avatar: z.string().url().nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
