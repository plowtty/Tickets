import AgentStats from '../components/dashboard/AgentStats';
import MetricCard from '../components/dashboard/MetricCard';
import PriorityChart from '../components/dashboard/PriorityChart';
import RecentTickets from '../components/dashboard/RecentTickets';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { useI18n } from '../hooks/useI18n';
import { getStatusLabel, statusTone } from '../utils/labels';

const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, agentStats, isLoading, error, refetch } = useDashboard();
  const { t } = useI18n();

  const statusLabel = getStatusLabel(t);

  if (isLoading && !stats) {
    return (
      <section className="surface-card p-6">
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.loading')}</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="surface-card space-y-3 p-6">
        <h2 className="section-title">{t('dashboard.title')}</h2>
        <p className="text-sm text-red-600">{error ?? t('dashboard.loading')}</p>
        <button
          onClick={() => void refetch()}
          className="btn-primary"
        >
          {t('dashboard.retry')}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">{t('dashboard.title')}</h2>
          <p className="section-subtitle">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          className="btn-secondary"
        >
          {t('dashboard.refresh')}
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      <div className="app-grid-3">
        <MetricCard title={t('dashboard.total')} value={stats.totalTickets} subtitle="" />
        <MetricCard title={t('dashboard.open')} value={stats.openTickets} subtitle="" tone="blue" />
        <MetricCard
          title={t('dashboard.inProgress')}
          value={stats.inProgressTickets}
          subtitle=""
          tone="amber"
        />
      </div>

      <div className="app-grid-2">
        <PriorityChart items={stats.byPriority} />
        <div className="panel-card">
          <h3 className="panel-title">{t('dashboard.byStatus')}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm xl:grid-cols-4">
            {stats.byStatus.map((item) => (
              <div key={item.status} className={`rounded-xl border p-3 text-center ${statusTone[item.status]}`}>
                <p className="text-sm font-medium">{statusLabel[item.status]}</p>
                <p className="mt-1 text-2xl font-semibold">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="app-grid-2">
        <RecentTickets tickets={stats.recentTickets} />
        {user?.role === 'ADMIN' ? (
          <AgentStats items={agentStats} />
        ) : (
          <div className="panel-card">
            <h3 className="panel-title">{t('dashboard.opsSummary')}</h3>
            <p className="panel-subtitle">
              {t('dashboard.opsSummaryText')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
