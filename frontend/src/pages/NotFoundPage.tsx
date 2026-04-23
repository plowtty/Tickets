import { Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';

const NotFoundPage = () => {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('notFound.title')}</p>
      <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-blue-700 hover:bg-slate-100 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800" to="/dashboard">
        {t('notFound.goDashboard')}
      </Link>
    </div>
  );
};

export default NotFoundPage;
