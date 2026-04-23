import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { useUiStore } from '../../store/uiStore';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, language } = useI18n();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const setLanguage = useUiStore((state) => state.setLanguage);

  return (
    <header className="sticky top-0 z-10 px-4 py-3 md:px-6" style={{ backgroundColor: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-3)' }}>
            {t('nav.sessionActive')}
          </p>
          <p className="font-semibold" style={{ color: 'var(--c-text)' }}>{user?.name}</p>
          <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>{user?.role}</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
            className="input-field w-24 py-1.5 text-center"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>

          <button
            onClick={toggleTheme}
            className="btn-secondary flex items-center gap-2 px-3"
            title={theme === 'light' ? t('theme.dark') : t('theme.light')}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            <span className="text-sm">{theme === 'light' ? t('theme.dark') : t('theme.light')}</span>
          </button>

          <button onClick={() => void logout()} className="btn-secondary">
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
