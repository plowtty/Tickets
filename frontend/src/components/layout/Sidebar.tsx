import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

const baseClass = 'block rounded-xl px-3 py-2.5 text-sm font-medium transition-all';

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <aside className="hidden w-64 shrink-0 p-5 md:flex md:flex-col" style={{ backgroundColor: 'var(--c-surface)', borderRight: '1px solid var(--c-border)' }}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-3)' }}>
          {t('nav.workspace')}
        </p>
        <h1 className="mt-2 text-xl font-bold" style={{ color: 'var(--c-text)' }}>Help Desk</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--c-text-3)' }}>{t('nav.helpdeskSubtitle')}</p>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${baseClass} ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
            }`
          }
        >
          📊 {t('nav.dashboard')}
        </NavLink>

        <NavLink
          to="/tickets"
          end
          className={({ isActive }) =>
            `${baseClass} ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
            }`
          }
        >
          🎫 {t('nav.tickets')}
        </NavLink>

        {(user?.role === 'ADMIN' || user?.role === 'AGENT') && (
          <NavLink
            to="/tickets/new"
            className={({ isActive }) =>
              `${baseClass} ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
              }`
            }
          >
            ➕ {t('nav.createTicket')}
          </NavLink>
        )}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `${baseClass} ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
              }`
            }
          >
            👥 {t('nav.users')}
          </NavLink>
        )}
      </nav>

    </aside>
  );
};

export default Sidebar;
