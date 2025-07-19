import { useCallback, useState } from 'react';
import i18n from '../utils/i18n';

export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale);

  const t = useCallback((key: string, options?: any) => {
    return i18n.t(key, options);
  }, []);

  const changeLanguage = useCallback((newLocale: string) => {
    i18n.locale = newLocale;
    setLocale(newLocale);
  }, []);

  return {
    t,
    locale,
    changeLanguage,
    isRTL: i18n.locale === 'ar' || i18n.locale === 'he', // For future RTL support
  };
}; 