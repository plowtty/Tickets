import { Role } from '@prisma/client';
import { z } from 'zod';

export const updateUserSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	role: z.nativeEnum(Role).optional(),
	active: z.boolean().optional(),
	avatar: z.string().url().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
