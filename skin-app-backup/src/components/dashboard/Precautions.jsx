import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  AlertTriangle,
  Sun,
  Search,
  Droplet,
  Salad,
  CigaretteOff,
  Stethoscope,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const precautionKeys = [
  {
    icon: Sun,
    key: 'sun',
    chip: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    ring: 'hover:ring-amber-200 dark:hover:ring-amber-800/60',
  },
  {
    icon: Search,
    key: 'checks',
    chip: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    ring: 'hover:ring-blue-200 dark:hover:ring-blue-800/60',
  },
  {
    icon: Droplet,
    key: 'hydration',
    chip: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800',
    ring: 'hover:ring-cyan-200 dark:hover:ring-cyan-800/60',
  },
  {
    icon: Salad,
    key: 'diet',
    chip: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
    ring: 'hover:ring-green-200 dark:hover:ring-green-800/60',
  },
  {
    icon: CigaretteOff,
    key: 'habits',
    chip: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
    ring: 'hover:ring-red-200 dark:hover:ring-red-800/60',
  },
  {
    icon: Stethoscope,
    key: 'doctor',
    chip: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
    ring: 'hover:ring-purple-200 dark:hover:ring-purple-800/60',
  },
];

const Precautions = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t('dashboard.precautions.title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {t('dashboard.precautions.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div className="relative bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex gap-3 items-start overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
            {t('dashboard.precautions.warningTitle')}
          </p>
          <p className="text-red-600 dark:text-red-300 text-xs mt-1 leading-relaxed">
            {t('dashboard.precautions.warningBody')}
          </p>
        </div>
      </div>

      {/* Precaution cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {precautionKeys.map((item) => {
          const tips = t(`dashboard.precautions.${item.key}.tips`, { returnObjects: true });
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`group relative ${item.color} border rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 ring-1 ring-transparent ${item.ring} transition-all duration-300`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.chip} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-[15px]">
                {t(`dashboard.precautions.${item.key}.title`)}
              </h3>
              <ul className="space-y-2.5">
                {Array.isArray(tips) && tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex gap-3 items-center">
        <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          {t('dashboard.precautions.footerTip', 'Following these habits consistently can significantly reduce your risk of skin conditions.')}
        </p>
      </div>
    </div>
  );
};

export default Precautions;
