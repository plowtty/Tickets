import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const location = useLocation();
  const { bootstrap, initialized, isAuthenticated } = useAuth();
  const { t } = useI18n();

  const reason = new URLSearchParams(location.search).get('reason');
  const sessionExpired = reason === 'session-expired';

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (initialized && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: 'var(--c-bg)' }}>
      <div className="w-full max-w-md rounded-2xl p-7 shadow-lg" style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <p className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {t('auth.platform')}
        </p>
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('auth.welcome')}</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
          {isRegister ? t('auth.createAccount') : t('auth.signInToManage')}
        </p>

        {sessionExpired && !isRegister && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            {t('auth.sessionExpired')}
          </p>
        )}

        {isRegister ? <RegisterForm /> : <LoginForm />}

        <button
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => setIsRegister((prev) => !prev)}
        >
          {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
