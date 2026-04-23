import { Priority, TicketStatus } from '@prisma/client';
import { z } from 'zod';

export const createTicketSchema = z.object({
	title: z.string().min(3).max(200),
	description: z.string().min(10).max(5000),
	priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
	assignedToId: z.string().uuid().optional(),
});

export const updateTicketSchema = z.object({
	title: z.string().min(3).max(200).optional(),
	description: z.string().min(10).max(5000).optional(),
	priority: z.nativeEnum(Priority).optional(),
	status: z.nativeEnum(TicketStatus).optional(),
	assignedToId: z.string().uuid().nullable().optional(),
});

export const updateTicketStatusSchema = z.object({
	status: z.nativeEnum(TicketStatus),
});

export const assignTicketSchema = z.object({
	assignedToId: z.string().uuid().nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
