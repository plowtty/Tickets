import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticket.service';
import { userService } from '../services/user.service';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../hooks/useI18n';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getPriorityLabel, priorityColor } from '../utils/labels';
import type { Priority } from '../types';
import type { User } from '../types';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const priorityLabel = getPriorityLabel(t);
  const PRIORITIES: { value: Priority; label: string; color: string }[] = (
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Priority[]
  ).map((v) => ({ value: v, label: priorityLabel[v], color: priorityColor[v] }));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (isStaff) {
      userService
        .list()
        .then((users) => setAgents(users.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN')))
        .catch(() => {});
    }
  }, [isStaff]);

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!title.trim()) errs.title = t('createTicket.errorTitleRequired');
    else if (title.trim().length < 5) errs.title = t('createTicket.errorTitleMin');
    if (!description.trim()) errs.description = t('createTicket.errorDescRequired');
    else if (description.trim().length < 10) errs.description = t('createTicket.errorDescMin');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const ticket = await ticketService.create({
        title: title.trim(),
        description: description.trim(),
        priority,
        ...(isStaff && assignedToId ? { assignedToId } : {}),
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(getErrorMessage(err, t('createTicket.errorCreate')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="section-title">{t('createTicket.title')}</h1>
        <p className="section-subtitle mt-1">{t('createTicket.subtitle')}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="surface-card space-y-5 p-6"
      >
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--c-text-2)' }} htmlFor="title">
            {t('createTicket.ticketTitle')} <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('createTicket.titlePlaceholder')}
            className={`input-field ${
              fieldErrors.title ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/30' : ''
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--c-text-2)' }} htmlFor="description">
            {t('createTicket.ticketDescription')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('createTicket.descPlaceholder')}
            className={`input-field resize-none ${
              fieldErrors.description ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/30' : ''
            }`}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.description}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--c-text-2)' }}>
            {t('createTicket.priority')}
          </label>
          <div className="flex gap-3">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                style={priority !== p.value ? { backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text-2)' } : undefined}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                  priority === p.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-600'
                    : 'hover:opacity-80'
                }`}
              >
                <span className={priority === p.value ? '' : p.color}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Agent assignment (staff only) */}
        {isStaff && (
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--c-text-2)' }} htmlFor="agent">
              {t('createTicket.assignAgent')}{' '}
              <span className="text-xs font-normal text-slate-400">{t('createTicket.optional')}</span>
            </label>
            <select
              id="agent"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="input-field"
            >
              <option value="">{t('ticketDetail.unassigned')}</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="btn-secondary"
          >
            {t('createTicket.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary gap-2"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? t('createTicket.creating') : t('createTicket.create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketPage;

