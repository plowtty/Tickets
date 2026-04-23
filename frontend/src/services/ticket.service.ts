import { api } from './api';
import {
	ApiResponse,
	PaginatedApiResponse,
	Ticket,
	TicketComment,
	TicketDetail,
	TicketFilters,
	TicketStatus,
	Priority,
} from '../types';

type ListTicketsParams = TicketFilters & {
	page?: number;
	limit?: number;
};

export const ticketService = {
	async list(params: ListTicketsParams) {
		const { data } = await api.get<PaginatedApiResponse<Ticket>>('/tickets', {
			params,
		});

		return data;
	},

	async getById(id: string) {
		const { data } = await api.get<ApiResponse<TicketDetail>>(`/tickets/${id}`);
		return data.data;
	},

	async updateStatus(id: string, status: TicketStatus) {
		const { data } = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, { status });
		return data.data;
	},

	async assign(id: string, assignedToId?: string) {
		const { data } = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/assign`, {
			assignedToId: assignedToId || null,
		});
		return data.data;
	},

	async createComment(ticketId: string, body: string) {
		const { data } = await api.post<ApiResponse<TicketComment>>(`/tickets/${ticketId}/comments`, {
			body,
		});
		return data.data;
	},

	async deleteComment(ticketId: string, commentId: string) {
		await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
	},

	async create(payload: {
		title: string;
		description: string;
		priority: Priority;
		assignedToId?: string;
	}) {
		const { data } = await api.post<ApiResponse<Ticket>>('/tickets', payload);
		return data.data;
	},

	async delete(id: string) {
		await api.delete(`/tickets/${id}`);
	},
};
