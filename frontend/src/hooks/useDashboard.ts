import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useDashboardStore } from '../store/dashboardStore';

export const useDashboard = () => {
	const { user } = useAuth();
	const stats = useDashboardStore((state) => state.stats);
	const agentStats = useDashboardStore((state) => state.agentStats);
	const isLoading = useDashboardStore((state) => state.isLoading);
	const error = useDashboardStore((state) => state.error);
	const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

	useEffect(() => {
		if (!user) {
			return;
		}

		void fetchDashboard(user.role === 'ADMIN');
	}, [fetchDashboard, user]);

	return {
		stats,
		agentStats,
		isLoading,
		error,
		refetch: () => fetchDashboard(user?.role === 'ADMIN'),
	};
};
