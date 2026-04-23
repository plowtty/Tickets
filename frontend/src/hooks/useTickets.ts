import { useEffect } from 'react';
import { useTicketStore } from '../store/ticketStore';

export const useTickets = () => {
	const tickets = useTicketStore((state) => state.tickets);
	const filters = useTicketStore((state) => state.filters);
	const pagination = useTicketStore((state) => state.pagination);
	const page = useTicketStore((state) => state.page);
	const limit = useTicketStore((state) => state.limit);
	const isLoading = useTicketStore((state) => state.isLoading);
	const error = useTicketStore((state) => state.error);
	const setPage = useTicketStore((state) => state.setPage);
	const setLimit = useTicketStore((state) => state.setLimit);
	const setFilter = useTicketStore((state) => state.setFilter);
	const clearFilters = useTicketStore((state) => state.clearFilters);
	const fetchTickets = useTicketStore((state) => state.fetchTickets);

	useEffect(() => {
		void fetchTickets();
	}, [
		fetchTickets,
		page,
		limit,
		filters.status,
		filters.priority,
		filters.assignedToId,
		filters.search,
		filters.startDate,
		filters.endDate,
	]);

	return {
		tickets,
		filters,
		pagination,
		page,
		limit,
		isLoading,
		error,
		setPage,
		setLimit,
		setFilter,
		clearFilters,
		refetch: fetchTickets,
	};
};
