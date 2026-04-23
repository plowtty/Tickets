import { api } from './api';
import { AgentDashboardStat, ApiResponse, DashboardStats } from '../types';

export const dashboardService = {
	async getStats() {
		const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
		return data.data;
	},

	async getAgentStats() {
		const { data } = await api.get<ApiResponse<AgentDashboardStat[]>>('/dashboard/agent-stats');
		return data.data;
	},
};
