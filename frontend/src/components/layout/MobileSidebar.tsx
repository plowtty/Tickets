import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

const MobileSidebar = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
    }`;

  return (
    <div className="px-4 py-2 md:hidden" style={{ backgroundColor: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
      <div className="flex flex-wrap gap-2">
        <NavLink to="/dashboard" className={itemClass}>
          {t('nav.dashboard')}
        </NavLink>
        <NavLink to="/tickets" className={itemClass}>
          {t('nav.tickets')}
        </NavLink>
        {(user?.role === 'ADMIN' || user?.role === 'AGENT') && (
          <NavLink to="/tickets/new" className={itemClass}>
            {t('nav.createTicket')}
          </NavLink>
        )}
        {user?.role === 'ADMIN' && (
          <NavLink to="/users" className={itemClass}>
            {t('nav.users')}
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default MobileSidebar;
