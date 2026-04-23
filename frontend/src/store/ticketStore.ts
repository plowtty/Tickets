import { create } from 'zustand';
import { PaginationMeta, Ticket, TicketFilters } from '../types';
import { ticketService } from '../services/ticket.service';
import { getErrorMessage } from '../utils/getErrorMessage';

type TicketState = {
	tickets: Ticket[];
	filters: TicketFilters;
	pagination: PaginationMeta;
	page: number;
	limit: number;
	isLoading: boolean;
	error: string | null;
	setPage: (page: number) => void;
	setLimit: (limit: number) => void;
	setFilter: (key: keyof TicketFilters, value?: string) => void;
	clearFilters: () => void;
	fetchTickets: () => Promise<void>;
};

const defaultPagination: PaginationMeta = {
	total: 0,
	page: 1,
	limit: 10,
	totalPages: 1,
	hasNextPage: false,
	hasPrevPage: false,
};

const normalizeError = (error: unknown) => getErrorMessage(error, 'No se pudieron cargar los tickets');

export const useTicketStore = create<TicketState>((set, get) => ({
	tickets: [],
	filters: {},
	pagination: defaultPagination,
	page: 1,
	limit: 10,
	isLoading: false,
	error: null,

	setPage(page) {
		set({ page });
	},

	setLimit(limit) {
		set({ limit, page: 1 });
	},

	setFilter(key, value) {
		set((state) => ({
			filters: {
				...state.filters,
				[key]: value || undefined,
			},
			page: 1,
		}));
	},

	clearFilters() {
		set({ filters: {}, page: 1 });
	},

	async fetchTickets() {
		set({ isLoading: true, error: null });
		const { page, limit, filters } = get();

		try {
			const response = await ticketService.list({
				page,
				limit,
				...filters,
			});

			set({
				tickets: response.data,
				pagination: response.pagination,
				isLoading: false,
			});
		} catch (error) {
			set({
				isLoading: false,
				error: normalizeError(error),
			});
		}
	},
}));
