import { useTranslation } from 'react-i18next';
import { BookOpen, Upload, Brain, ClipboardList } from 'lucide-react';

const stepConfig = [
  { step: '01', icon: Upload, key: 'step1', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-600 dark:bg-blue-700' },
  { step: '02', icon: Brain, key: 'step2', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-600 dark:bg-cyan-700' },
  { step: '03', icon: ClipboardList, key: 'step3', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-600 dark:bg-purple-700' },
];

const HowItWorks = () => {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <BookOpen className="w-3.5 h-3.5" /> {t('howItWorks.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3">
            {t('howItWorks.title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {stepConfig.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="relative text-center">

                {index < stepConfig.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-600 z-0"></div>
                )}

                <div className={`relative z-10 w-20 h-20 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className={`text-xs font-bold ${item.color} mb-2`}>
                  {t('howItWorks.stepLabel')} {item.step}
                </div>

                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t(`howItWorks.${item.key}.title`)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {t(`howItWorks.${item.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
