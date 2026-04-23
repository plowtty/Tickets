import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { useTickets } from '../hooks/useTickets';
import { useI18n } from '../hooks/useI18n';
import { userService } from '../services/user.service';
import { Priority, TicketStatus, User } from '../types';
import { getStatusLabel, getPriorityLabel, statusClasses, priorityClasses } from '../utils/labels';

const statusOptions: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const priorityOptions: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];



const TicketsPage = () => {
  const { t, language, formatDate } = useI18n();
  const { user } = useAuth();
  const {
    tickets,
    filters,
    pagination,
    page,
    limit,
    isLoading,
    error,
    setPage,
    setLimit,
    setFilter,
    clearFilters,
  } = useTickets();

  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [agents, setAgents] = useState<User[]>([]);
  const debouncedSearch = useDebounce(searchInput, 400);
  const { pages, hasNext, hasPrev } = usePagination(page, pagination.totalPages || 1);

  useEffect(() => {
    setFilter('search', debouncedSearch.trim() || undefined);
  }, [debouncedSearch, setFilter]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
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
  }, [user?.role]);

  const hasFilters = useMemo(() => {
    return Boolean(
      filters.search ||
        filters.status ||
        filters.priority ||
        filters.assignedToId ||
        filters.startDate ||
        filters.endDate
    );
  }, [filters]);

  const statusLabel = getStatusLabel(t);
  const priorityLabel = getPriorityLabel(t);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">{t('tickets.title')}</h2>
          <p className="section-subtitle">{t('tickets.subtitle')}</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          {t('tickets.new')}
        </Link>
      </div>

      <div className="surface-soft p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
          <input
            placeholder={t('tickets.search')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="input-field md:col-span-2 xl:col-span-4"
          />

          <select
            value={filters.status ?? ''}
            onChange={(event) => setFilter('status', event.target.value || undefined)}
            className="input-field xl:col-span-2"
          >
            <option value="">{t('tickets.allStatuses')}</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>

          <select
            value={filters.priority ?? ''}
            onChange={(event) => setFilter('priority', event.target.value || undefined)}
            className="input-field xl:col-span-2"
          >
            <option value="">{t('tickets.allPriorities')}</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabel[priority]}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(event) => setFilter('startDate', event.target.value || undefined)}
            className="input-field xl:col-span-2"
          />

          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(event) => setFilter('endDate', event.target.value || undefined)}
            className="input-field xl:col-span-2"
          />

          {user?.role === 'ADMIN' && (
            <select
              value={filters.assignedToId ?? ''}
              onChange={(event) => setFilter('assignedToId', event.target.value || undefined)}
              className="input-field xl:col-span-2"
            >
              <option value="">{t('tickets.allAgents')}</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">{t('tickets.perPage')}</label>
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setSearchInput('');
                clearFilters();
              }}
              className="btn-secondary px-3 py-1"
            >
              {t('tickets.clearFilters')}
            </button>
          )}
        </div>
      </div>

      <div className="panel-card overflow-hidden p-0">
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-black dark:bg-slate-800/95 dark:text-white">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">{t('common.status')}</th>
                <th className="px-4 py-3">{t('ticketDetail.priority')}</th>
                <th className="px-4 py-3">{t('tickets.client')}</th>
                <th className="px-4 py-3">{t('tickets.agent')}</th>
                <th className="px-4 py-3">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-black dark:divide-slate-800 dark:text-white [&_td]:align-top">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                    {t('tickets.loading')}
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                    {t('tickets.empty')}
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <Link to={`/tickets/${ticket.id}`} className="font-medium text-blue-700 hover:underline dark:text-blue-300">
                        {ticket.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-slate-700 dark:text-slate-200">{ticket.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[ticket.status]}`}>
                        {statusLabel[ticket.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityClasses[ticket.priority]}`}>
                        {priorityLabel[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{ticket.createdBy?.name ?? '—'}</td>
                    <td className="px-4 py-3">{ticket.assignedTo?.name ?? t('ticketDetail.unassigned')}</td>
                    <td className="px-4 py-3">{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-300">
            {language === 'es'
              ? `Mostrando página ${pagination.page} de ${Math.max(1, pagination.totalPages)} · ${pagination.total} tickets`
              : `Showing page ${pagination.page} of ${Math.max(1, pagination.totalPages)} · ${pagination.total} tickets`}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!hasPrev}
              className="btn-secondary px-2 py-1"
            >
              {t('tickets.prev')}
            </button>

            {pages.map((itemPage) => (
              <button
                key={itemPage}
                onClick={() => setPage(itemPage)}
                className={`rounded-md px-2 py-1 ${
                  itemPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                {itemPage}
              </button>
            ))}

            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasNext}
              className="btn-secondary px-2 py-1"
            >
              {t('tickets.next')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketsPage;
