import type { Priority, TicketStatus } from '../types';

type TFn = (key: string) => string;

export const getStatusLabel = (t: TFn): Record<TicketStatus, string> => ({
  OPEN: t('status.open'),
  IN_PROGRESS: t('status.inProgress'),
  RESOLVED: t('status.resolved'),
  CLOSED: t('status.closed'),
});

export const getPriorityLabel = (t: TFn): Record<Priority, string> => ({
  LOW: t('priority.low'),
  MEDIUM: t('priority.medium'),
  HIGH: t('priority.high'),
  CRITICAL: t('priority.critical'),
});

export const statusClasses: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/55 dark:text-white dark:ring-1 dark:ring-blue-700/60',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/55 dark:text-white dark:ring-1 dark:ring-amber-700/60',
  RESOLVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/55 dark:text-white dark:ring-1 dark:ring-emerald-700/60',
  CLOSED: 'bg-slate-100 text-slate-800 dark:bg-slate-800/90 dark:text-white dark:ring-1 dark:ring-slate-600/60',
};

export const priorityClasses: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-800 dark:bg-slate-800/90 dark:text-white dark:ring-1 dark:ring-slate-600/60',
  MEDIUM: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/55 dark:text-white dark:ring-1 dark:ring-indigo-700/60',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/55 dark:text-white dark:ring-1 dark:ring-orange-700/60',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/55 dark:text-white dark:ring-1 dark:ring-red-700/60',
};

export const priorityColor: Record<Priority, string> = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-amber-500',
  CRITICAL: 'text-red-600',
};

export const statusTone: Record<TicketStatus, string> = {
  OPEN: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/60 dark:bg-blue-900/30 dark:text-blue-100',
  IN_PROGRESS: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-100',
  RESOLVED: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-100',
  CLOSED: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100',
};
