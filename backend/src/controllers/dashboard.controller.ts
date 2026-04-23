import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
	async stats(_req: Request, res: Response, next: NextFunction) {
		try {
			const stats = await dashboardService.stats();
			ApiResponse.success(res, stats);
		} catch (error) {
			next(error);
		}
	},

	async agentStats(_req: Request, res: Response, next: NextFunction) {
		try {
			const stats = await dashboardService.agentStats();
			ApiResponse.success(res, stats);
		} catch (error) {
			next(error);
		}
	},
};
