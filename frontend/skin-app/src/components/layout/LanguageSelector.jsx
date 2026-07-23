import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';

const LanguageSelector = ({ className = '', fullWidth = false }) => {
  const { t, i18n } = useTranslation();

  const indianLanguages = SUPPORTED_LANGUAGES.filter((l) => l.group === 'indian');
  const internationalLanguages = SUPPORTED_LANGUAGES.filter((l) => l.group === 'international');

  const baseClass =
    'text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200';

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={`${baseClass} ${fullWidth ? 'w-full py-2' : 'max-w-[160px]'} ${className}`}
      aria-label={t('dashboard.language')}
    >
      <optgroup label={t('nav.indianLanguages')}>
        {indianLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {t(lang.labelKey)}
          </option>
        ))}
      </optgroup>
      <optgroup label={t('nav.internationalLanguages')}>
        {internationalLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {t(lang.labelKey)}
          </option>
        ))}
      </optgroup>
    </select>
  );
};

export default LanguageSelector;
