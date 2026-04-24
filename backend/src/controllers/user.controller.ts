import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { userService } from '../services/user.service';

export const userController = {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const user = await userService.create(req.body);
			ApiResponse.created(res, user, 'User created successfully');
		} catch (error) {
			next(error);
		}
	},

	async list(_req: Request, res: Response, next: NextFunction) {
		try {
			const users = await userService.list();
			ApiResponse.success(res, users);
		} catch (error) {
			next(error);
		}
	},

	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const user = await userService.update(req.params.id, req.body);
			ApiResponse.success(res, user, 200, 'User updated successfully');
		} catch (error) {
			next(error);
		}
	},

	async remove(req: Request, res: Response, next: NextFunction) {
		try {
			await userService.remove(req.params.id);
			ApiResponse.noContent(res);
		} catch (error) {
			next(error);
		}
	},
};
