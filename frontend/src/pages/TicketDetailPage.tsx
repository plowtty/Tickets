import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { ticketService } from '../services/ticket.service';
import { userService } from '../services/user.service';
import { TicketDetail, TicketStatus, User } from '../types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getStatusLabel, getPriorityLabel } from '../utils/labels';

const statusOptions: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('OPEN');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAssign = user?.role === 'ADMIN' || user?.role === 'AGENT';
  const canManageStatus = Boolean(user);

  const statusLabel = getStatusLabel(t);
  const priorityLabel = getPriorityLabel(t);

  const loadTicket = async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketService.getById(id);
      setTicket(data);
      setSelectedStatus(data.status);
      setSelectedAgent(data.assignedToId ?? '');
    } catch (error) {
      setError(getErrorMessage(error, t('ticketDetail.errorLoad')));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTicket();
  }, [id]);

  useEffect(() => {
    if (!canAssign) {
      return;
    }

    const loadAgents = async () => {
      try {
        const users = await userService.list();
        setAgents(users.filter((item) => item.role === 'AGENT'));
      } catch {
        setAgents([]);
      }
    };

    void loadAgents();
  }, [canAssign]);

  const canDeleteComment = useMemo(() => {
    return (commentAuthorId: string) => user?.role === 'ADMIN' || user?.id === commentAuthorId;
  }, [user?.id, user?.role]);

  const handleUpdateStatus = async () => {
    if (!ticket || !id) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await ticketService.updateStatus(id, selectedStatus);
      await loadTicket();
    } catch (error) {
      setError(getErrorMessage(error, t('ticketDetail.errorStatus')));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!ticket || !id) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await ticketService.assign(id, selectedAgent || undefined);
      await loadTicket();
    } catch (error) {
      setError(getErrorMessage(error, t('ticketDetail.errorAssign')));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !commentBody.trim()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await ticketService.createComment(id, commentBody.trim());
      setCommentBody('');
      await loadTicket();
    } catch (error) {
      setError(getErrorMessage(error, t('ticketDetail.errorCommentCreate')));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await ticketService.deleteComment(id, commentId);
      await loadTicket();
    } catch (error) {
      setError(getErrorMessage(error, t('ticketDetail.errorCommentDelete')));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="surface-card p-6">
        <p className="text-sm" style={{ color: 'var(--c-text-2)' }}>{t('ticketDetail.loading')}</p>
      </section>
    );
  }

  if (!ticket) {
    return (
      <section className="surface-card space-y-3 p-6">
        <p className="text-red-600 dark:text-red-400">{error ?? t('ticketDetail.notFound')}</p>
        <Link className="text-blue-600 hover:underline dark:text-blue-400" to="/tickets">
          {t('ticketDetail.back')}
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">{ticket.title}</h2>
          <p className="section-subtitle">{t('ticketDetail.createdBy')} {ticket.createdBy?.name}</p>
        </div>
        <Link className="btn-secondary" to="/tickets">
          {t('ticketDetail.back')}
        </Link>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-12">
        <article className="panel-card lg:col-span-8">
          <h3 className="panel-title">{t('ticketDetail.description')}</h3>
          <p className="mt-2 whitespace-pre-line text-sm" style={{ color: 'var(--c-text-2)' }}>{ticket.description}</p>

          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <div>
              <dt style={{ color: 'var(--c-text-3)' }}>{t('ticketDetail.status')}</dt>
              <dd className="font-medium" style={{ color: 'var(--c-text)' }}>{statusLabel[ticket.status]}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--c-text-3)' }}>{t('ticketDetail.priority')}</dt>
              <dd className="font-medium" style={{ color: 'var(--c-text)' }}>{priorityLabel[ticket.priority]}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--c-text-3)' }}>{t('ticketDetail.assignedAgent')}</dt>
              <dd className="font-medium" style={{ color: 'var(--c-text)' }}>{ticket.assignedTo?.name ?? t('ticketDetail.unassigned')}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--c-text-3)' }}>{t('common.date')}</dt>
              <dd className="font-medium" style={{ color: 'var(--c-text)' }}>{formatDateTime(ticket.createdAt)}</dd>
            </div>
          </dl>
        </article>

        <aside className="space-y-4 lg:col-span-4">
          <div className="panel-card p-4">
            <h3 className="panel-title">{t('ticketDetail.changeStatus')}</h3>
            <div className="mt-2 flex gap-2">
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as TicketStatus)}
                disabled={!canManageStatus || isSaving}
                className="input-field"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => void handleUpdateStatus()}
                disabled={!canManageStatus || isSaving || selectedStatus === ticket.status}
                className="btn-primary px-3"
              >
                {t('ticketDetail.save')}
              </button>
            </div>
          </div>

          {canAssign && (
            <div className="panel-card p-4">
              <h3 className="panel-title">{t('ticketDetail.assignAgent')}</h3>
              <div className="mt-2 flex gap-2">
                <select
                  value={selectedAgent}
                  onChange={(event) => setSelectedAgent(event.target.value)}
                  disabled={isSaving}
                  className="input-field"
                >
                  <option value="">{t('ticketDetail.unassigned')}</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => void handleAssign()}
                  disabled={isSaving || selectedAgent === (ticket.assignedToId ?? '')}
                  className="btn-secondary px-3"
                >
                  {t('ticketDetail.assign')}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="panel-card">
          <h3 className="panel-title">{t('ticketDetail.comments')}</h3>

          <form className="mt-3 space-y-2" onSubmit={handleCommentSubmit}>
            <textarea
              rows={3}
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder={t('ticketDetail.commentPlaceholder')}
              className="input-field"
            />
            <button
              type="submit"
              disabled={isSaving || !commentBody.trim()}
              className="btn-primary"
            >
              {t('ticketDetail.publish')}
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {ticket.comments.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--c-text-2)' }}>{t('ticketDetail.noComments')}</p>
            ) : (
              ticket.comments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-slate-200/80 p-3 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{comment.author.name}</p>
                    <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>{formatDateTime(comment.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: 'var(--c-text-2)' }}>{comment.body}</p>
                  {canDeleteComment(comment.authorId) && (
                    <button
                      onClick={() => void handleDeleteComment(comment.id)}
                      className="mt-2 text-xs text-red-600 hover:underline dark:text-red-400"
                    >
                      {t('ticketDetail.delete')}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel-card">
          <h3 className="panel-title">{t('ticketDetail.history')}</h3>
          <div className="mt-3 space-y-3">
            {ticket.history.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--c-text-2)' }}>{t('ticketDetail.noHistory')}</p>
            ) : (
              ticket.history.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200/80 p-3 text-sm transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700">
                  <p className="font-medium" style={{ color: 'var(--c-text)' }}>
                    {item.changedBy.name} {t('ticketDetail.changedField')} <span className="uppercase">{item.field}</span>
                  </p>
                  <p style={{ color: 'var(--c-text-2)' }}>
                    {item.oldValue ?? '∅'} → {item.newValue ?? '∅'}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--c-text-3)' }}>{formatDateTime(item.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
};

export default TicketDetailPage;
