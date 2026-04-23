import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/apiResponse';
import { commentService } from '../services/comment.service';

const createCommentSchema = z.object({
	body: z.string().min(1).max(3000),
});

export const commentController = {
	createSchema: createCommentSchema,

	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const comments = await commentService.list(req.params.ticketId, req.user!.id, req.user!.role);
			ApiResponse.success(res, comments);
		} catch (error) {
			next(error);
		}
	},

	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const comment = await commentService.create(
				req.params.ticketId,
				req.body.body,
				req.user!.id,
				req.user!.role
			);
			ApiResponse.created(res, comment, 'Comment created successfully');
		} catch (error) {
			next(error);
		}
	},

	async remove(req: Request, res: Response, next: NextFunction) {
		try {
			await commentService.remove(req.params.ticketId, req.params.commentId, req.user!.id, req.user!.role);
			ApiResponse.noContent(res);
		} catch (error) {
			next(error);
		}
	},
};
