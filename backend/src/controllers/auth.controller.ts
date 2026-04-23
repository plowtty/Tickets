import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';
import { loginProtection } from '../middleware/loginProtection.middleware';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,      // No accesible desde JS — protección contra XSS
  secure: env.IS_PRODUCTION,  // Solo HTTPS en producción
  sameSite: 'strict' as const,  // Protección contra CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      ApiResponse.created(res, { user, accessToken }, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);
      loginProtection.clear(req);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      logger.info(`Auth login success user=${user.email} ip=${req.ip} reqId=${req.requestId}`);
      ApiResponse.success(res, { user, accessToken }, 200, 'Login successful');
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 401) {
        loginProtection.registerFailure(req);
        logger.warn(`Auth login failed email=${req.body?.email ?? 'unknown'} ip=${req.ip} reqId=${req.requestId}`);
      }
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        ApiResponse.error(res, 'No refresh token provided', 401);
        return;
      }

      const { accessToken, refreshToken } = await authService.refresh(token);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      ApiResponse.success(res, { accessToken }, 200, 'Token refreshed');
    } catch (error) {
      logger.warn(`Auth refresh failed ip=${req.ip} reqId=${req.requestId}`);
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
    ApiResponse.success(res, null, 200, 'Logged out successfully');
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  },
};
