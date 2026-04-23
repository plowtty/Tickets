import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';

interface LoginAttemptState {
  failures: number;
  lockUntil: number | null;
}

const attempts = new Map<string, LoginAttemptState>();

const normalizedEmail = (email: unknown) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const buildAttemptKey = (req: Request) => {
  const email = normalizedEmail(req.body?.email);
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  return `${email}|${ip}`;
};

const getState = (key: string): LoginAttemptState => {
  const current = attempts.get(key);
  if (current) {
    return current;
  }

  const initial: LoginAttemptState = { failures: 0, lockUntil: null };
  attempts.set(key, initial);
  return initial;
};

const clearStateIfExpired = (state: LoginAttemptState) => {
  if (!state.lockUntil) {
    return;
  }

  if (Date.now() >= state.lockUntil) {
    state.failures = 0;
    state.lockUntil = null;
  }
};

export const loginProtection = {
  guard(req: Request, res: Response, next: NextFunction) {
    const key = buildAttemptKey(req);
    const state = getState(key);
    clearStateIfExpired(state);

    if (!state.lockUntil) {
      next();
      return;
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((state.lockUntil - Date.now()) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));

    ApiResponse.error(res, 'Too many failed login attempts. Please try again later.', 429);
  },

  registerFailure(req: Request) {
    const key = buildAttemptKey(req);
    const state = getState(key);
    clearStateIfExpired(state);

    state.failures += 1;

    if (state.failures >= env.LOGIN_MAX_ATTEMPTS) {
      state.lockUntil = Date.now() + env.LOGIN_LOCK_MINUTES * 60 * 1000;
    }
  },

  clear(req: Request) {
    const key = buildAttemptKey(req);
    attempts.delete(key);
  },
};
