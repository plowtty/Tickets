import { create } from 'zustand';
import { AgentDashboardStat, DashboardStats } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { getErrorMessage } from '../utils/getErrorMessage';

type DashboardState = {
	stats: DashboardStats | null;
	agentStats: AgentDashboardStat[];
	isLoading: boolean;
	error: string | null;
	fetchDashboard: (includeAgents?: boolean) => Promise<void>;
};

const normalizeError = (error: unknown) => getErrorMessage(error, 'No se pudo cargar el dashboard');

export const useDashboardStore = create<DashboardState>((set) => ({
	stats: null,
	agentStats: [],
	isLoading: false,
	error: null,

	async fetchDashboard(includeAgents = false) {
		set({ isLoading: true, error: null });
		try {
			const [stats, agentStats] = await Promise.all([
				dashboardService.getStats(),
				includeAgents ? dashboardService.getAgentStats() : Promise.resolve([]),
			]);

			set({ stats, agentStats, isLoading: false });
		} catch (error) {
			set({ isLoading: false, error: normalizeError(error) });
		}
	},
}));
