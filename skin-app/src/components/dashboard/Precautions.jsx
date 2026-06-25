import { useTranslation } from 'react-i18next';

const precautionKeys = [
  { icon: '☀️', key: 'sun', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800', iconBg: 'bg-amber-100 dark:bg-amber-900/40' },
  { icon: '🔍', key: 'checks', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800', iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
  { icon: '💧', key: 'hydration', color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40' },
  { icon: '🥦', key: 'diet', color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800', iconBg: 'bg-green-100 dark:bg-green-900/40' },
  { icon: '🚭', key: 'habits', color: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800', iconBg: 'bg-red-100 dark:bg-red-900/40' },
  { icon: '🏥', key: 'doctor', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800', iconBg: 'bg-purple-100 dark:bg-purple-900/40' },
];

const Precautions = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">⚠️ {t('dashboard.precautions.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {t('dashboard.precautions.subtitle')}
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-2xl">🚨</span>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400 text-sm">{t('dashboard.precautions.warningTitle')}</p>
          <p className="text-red-600 dark:text-red-300 text-xs mt-1">
            {t('dashboard.precautions.warningBody')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {precautionKeys.map((item) => {
          const tips = t(`dashboard.precautions.${item.key}.tips`, { returnObjects: true });
          return (
            <div
              key={item.key}
              className={`${item.color} border rounded-2xl p-5 hover:shadow-md transition-all`}
            >
              <div className={`${item.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-3">
                {t(`dashboard.precautions.${item.key}.title`)}
              </h3>
              <ul className="space-y-2">
                {Array.isArray(tips) && tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Precautions;
