import { FormEvent, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('admin@helpdesk.com');
  const [password, setPassword] = useState('Password123');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    try {
      await login({ email, password });
    } catch {
      return;
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('auth.email')}</label>
        <input
          type="email"
          className="input-field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('auth.password')}</label>
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? t('auth.signingIn') : t('auth.signIn')}
      </button>
    </form>
  );
};

export default LoginForm;
