import { useUiStore } from '../store/uiStore';
import { translations } from '../i18n/translations';

export const useI18n = () => {
  const language = useUiStore((state) => state.language);

  const t = (key: string, fallback?: string) => {
    const entry = translations[key];
    if (!entry) {
      return fallback ?? key;
    }
    return entry[language] ?? fallback ?? key;
  };

  const locale = language === 'es' ? 'es-MX' : 'en-US';

  const formatDate = (value: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    new Date(value).toLocaleDateString(locale, options);

  const formatDateTime = (value: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    new Date(value).toLocaleString(locale, options);

  return {
    language,
    locale,
    t,
    formatDate,
    formatDateTime,
  };
};
