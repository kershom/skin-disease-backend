import { useTranslation } from 'react-i18next';
import { Bot, Camera, BookOpen, Layers, Globe, Lock, Sparkles } from 'lucide-react';

const featureKeys = [
  {
    icon: Bot, key: 'aiPrediction',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-600',
    hoverShadow: 'hover:shadow-blue-100 dark:hover:shadow-blue-950/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Camera, key: 'webcam',
    color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-600',
    hoverShadow: 'hover:shadow-cyan-100 dark:hover:shadow-cyan-950/40',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40', iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    icon: BookOpen, key: 'awareness',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-600',
    hoverShadow: 'hover:shadow-purple-100 dark:hover:shadow-purple-950/40',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Layers, key: 'gradcam',
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/60',
    hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-500',
    hoverShadow: 'hover:shadow-orange-100 dark:hover:shadow-orange-950/40',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    icon: Globe, key: 'multilingual',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
    hoverBorder: 'hover:border-green-300 dark:hover:border-green-600',
    hoverShadow: 'hover:shadow-green-100 dark:hover:shadow-green-950/40',
    iconBg: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Lock, key: 'secure',
    color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-600',
    hoverShadow: 'hover:shadow-rose-100 dark:hover:shadow-rose-950/40',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40', iconColor: 'text-rose-600 dark:text-rose-400',
  },
];

const Features = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> {t('features.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3">
            {t('features.title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.key}
                className={`group ${feature.color} border rounded-2xl p-6 ${feature.hoverBorder} ${feature.hoverShadow} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`${feature.iconBg} ${feature.iconColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Features;
