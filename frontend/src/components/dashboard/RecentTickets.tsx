import { Link } from 'react-router-dom';
import { DashboardStats } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface RecentTicketsProps {
	tickets: DashboardStats['recentTickets'];
}

const RecentTickets = ({ tickets }: RecentTicketsProps) => {
	const { t, formatDate } = useI18n();
	return (
		<div className="panel-card">
			<h3 className="panel-title">{t('dashboard.recent')}</h3>
			<div className="mt-4 space-y-3">
				{tickets.length === 0 ? (
					<p className="surface-soft p-3 text-sm text-slate-500 dark:text-slate-300">{t('dashboard.recentEmpty')}</p>
				) : (
					tickets.map((ticket) => (
						<div key={ticket.id} className="rounded-xl border border-slate-200/80 p-3 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700">
							<div className="flex items-start justify-between gap-3">
								<div>
									<Link to={`/tickets/${ticket.id}`} className="font-medium text-blue-700 hover:underline dark:text-blue-300">
										{ticket.title}
									</Link>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										{ticket.createdBy?.name ?? '—'} · {ticket.assignedTo?.name ?? t('dashboard.unassigned')}
									</p>
								</div>
								<span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(ticket.createdAt)}</span>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default RecentTickets;
